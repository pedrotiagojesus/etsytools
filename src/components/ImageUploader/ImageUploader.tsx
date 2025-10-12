import React, { useState } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// CSS
import "./ImageUploader.css";

type ImageItem = {
    id: string;
    file: File;
    preview: string;
};

type Props = {
    onChange: (images: File[]) => void;
    renderOverlay?: (file: File) => React.ReactNode;
};

function SortableImage({
    id,
    preview,
    file,
    onRemove,
    renderOverlay,
}: {
    id: string;
    preview: string;
    file: File;
    onRemove: (id: string) => void;
    renderOverlay?: (file: File) => React.ReactNode;
}) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition
    };

    return (
        <div ref={setNodeRef} className="img-wrapper" style={style}>
            <img src={preview} alt="preview" />

            {renderOverlay && <div className="img-info">{renderOverlay(file)}</div>}

            <button
                className="remove-img"
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onRemove(id);
                }}
            >
                ×
            </button>

            <div
                {...attributes}
                {...listeners}
                style={{
                    position: "absolute",
                    left: 2,
                    bottom: 2,
                    background: "rgba(0,0,0,0.5)",
                    color: "#fff",
                    fontSize: "12px",
                    padding: "2px 4px",
                    borderRadius: "3px",
                    cursor: "grab",
                    userSelect: "none",
                }}
            >
                ☰
            </div>
        </div>
    );
}

const ImageUploader: React.FC<Props> = ({ onChange, renderOverlay }) => {
    const [images, setImages] = useState<ImageItem[]>([]);

    const sensors = useSensors(useSensor(PointerSensor));

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const fileArray = Array.from(files).map((file, index) => ({
            id: `${Date.now()}-${index}`,
            file,
            preview: URL.createObjectURL(file),
        }));

        const updated = [...images, ...fileArray];
        setImages(updated);
        onChange(updated.map((img) => img.file));
    };

    const handleRemove = (id: string) => {
        const updated = images.filter((img) => img.id !== id);
        setImages(updated);
        onChange(updated.map((img) => img.file));
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = images.findIndex((img) => img.id === active.id);
        const newIndex = images.findIndex((img) => img.id === over.id);

        const reordered = arrayMove(images, oldIndex, newIndex);
        setImages(reordered);
        onChange(reordered.map((img) => img.file));
    };

    return (
        <div>
            <label htmlFor="images" className="form-label">
                Selecione as imagens
            </label>
            <input
                id="images"
                type="file"
                accept="image/*"
                className="form-control mb-2"
                multiple
                onChange={handleFileChange}
            />

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={images.map((img) => img.id)} strategy={horizontalListSortingStrategy}>
                    <div className="image-uploader">
                        {images.map((img) => (
                            <SortableImage
                                key={img.id}
                                id={img.id}
                                preview={img.preview}
                                file={img.file}
                                onRemove={handleRemove}
                                renderOverlay={renderOverlay}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
};

export default ImageUploader;
