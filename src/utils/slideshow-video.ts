/**
 * Builds a silent slideshow video (MP4/H.264) from slide images in the
 * browser: the images are drawn on a canvas, which MediaRecorder records in
 * real time. Chrome and Edge can record MP4; Firefox cannot.
 */

// Etsy listing videos must be MP4/MOV, so WebM (Firefox's only option) is not offered
const MP4_MIME_TYPES = ["video/mp4;codecs=avc1.640028", "video/mp4;codecs=avc1", "video/mp4"];

const VIDEO_BITS_PER_SECOND = 8_000_000;
const FRAMES_PER_SECOND = 30;
const TRANSITION_SECONDS = 0.6;
// Slow zoom on each slide, so the video is not a static picture
const ZOOM_END_SCALE = 1.06;

export interface SlideshowOptions {
    durationSeconds: number;
    width: number;
    height: number;
}

export const getSupportedVideoMimeType = (): string | null => {
    if (typeof MediaRecorder === "undefined") return null;
    return MP4_MIME_TYPES.find((mimeType) => MediaRecorder.isTypeSupported(mimeType)) ?? null;
};

const drawSlide = (
    context: CanvasRenderingContext2D,
    image: ImageBitmap,
    progress: number,
    opacity: number,
): void => {
    const { width, height } = context.canvas;
    const scale = Math.max(width / image.width, height / image.height) * (1 + (ZOOM_END_SCALE - 1) * progress);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;

    context.globalAlpha = opacity;
    context.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
    context.globalAlpha = 1;
};

/**
 * Draws the frame at `elapsed` seconds: the current slide with a slow zoom,
 * cross-fading into the next one at the end of its time.
 */
const drawFrame = (context: CanvasRenderingContext2D, images: ImageBitmap[], elapsed: number, slideSeconds: number): void => {
    const index = Math.min(Math.floor(elapsed / slideSeconds), images.length - 1);
    const timeInSlide = elapsed - index * slideSeconds;
    const current = images[index];
    const next = images[index + 1];
    if (!current) return;

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    drawSlide(context, current, timeInSlide / slideSeconds, 1);

    const transitionStart = slideSeconds - TRANSITION_SECONDS;
    if (next && timeInSlide > transitionStart) {
        drawSlide(context, next, 0, (timeInSlide - transitionStart) / TRANSITION_SECONDS);
    }
};

/**
 * Records the slideshow and resolves with the MP4 Blob. Takes as long as the
 * video lasts; the tab must stay visible, since hidden tabs pause drawing.
 */
export const createSlideshowVideo = async (slides: Blob[], options: SlideshowOptions): Promise<Blob> => {
    const mimeType = getSupportedVideoMimeType();
    if (!mimeType) {
        throw new Error("Este browser não grava vídeo MP4. Usa o Chrome ou o Edge.");
    }
    if (slides.length === 0) {
        throw new Error("Não há slides para o vídeo.");
    }

    const images = await Promise.all(slides.map((slide) => createImageBitmap(slide)));
    const canvas = document.createElement("canvas");
    canvas.width = options.width;
    canvas.height = options.height;

    const context = canvas.getContext("2d");
    if (!context) {
        throw new Error("Não foi possível criar o canvas do vídeo.");
    }

    const slideSeconds = options.durationSeconds / images.length;
    const stream = canvas.captureStream(FRAMES_PER_SECOND);
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: VIDEO_BITS_PER_SECOND });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
    };

    const stopped = new Promise<void>((resolve, reject) => {
        recorder.onstop = () => resolve();
        recorder.onerror = () => reject(new Error("Erro ao gravar o vídeo."));
    });

    drawFrame(context, images, 0, slideSeconds);
    recorder.start();

    await new Promise<void>((resolve) => {
        const startTime = performance.now();
        const renderNextFrame = (now: number) => {
            const elapsed = (now - startTime) / 1000;
            if (elapsed >= options.durationSeconds) {
                resolve();
                return;
            }
            drawFrame(context, images, elapsed, slideSeconds);
            requestAnimationFrame(renderNextFrame);
        };
        requestAnimationFrame(renderNextFrame);
    });

    recorder.stop();
    await stopped;

    stream.getTracks().forEach((track) => track.stop());
    images.forEach((image) => image.close());

    return new Blob(chunks, { type: "video/mp4" });
};
