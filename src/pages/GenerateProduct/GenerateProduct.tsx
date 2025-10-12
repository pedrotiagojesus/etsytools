import { useState } from "react";

// CSS
import "./GenerateProduct.css";

// Components
import ImageUploader from "../../components/ImageUploader/ImageUploader";
import ButtonSubmit from "../../components/ButtonSubmit/ButtonSubmit";
import EndpointFeedback from "../../components/EndpointFeedback/EndpointFeedback";

const GenerateProduct = () => {
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [images, setImages] = useState<File[]>([]);

    const [btnSumbit, setBtnSubmit] = useState({
        disabled: false,
        value: "Gerar Produto",
    });

    const [feedback, setFeedback] = useState({
        message: "",
        status: null as "success" | "error" | "warning" | "info" | "danger" | null,
    });

    const handleResize = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!images || images.length === 0) {
            setFeedback({
                message: "Selecione pelo menos uma imagem.",
                status: "warning",
            });
            return;
        }

        const formData = new FormData();
        Array.from(images).forEach((image) => {
            formData.append("images", image);
        });
        formData.append("pdfTitle", title);
        formData.append("pdfSubject", description);

        try {
            setBtnSubmit({
                value: "A gerar...",
                disabled: true,
            });

            setFeedback({
                message: "A gerar o produto...",
                status: "info",
            });

            const endpoint = `${import.meta.env.VITE_API_URL}/etsytools/generate-product`;
            const response = await fetch(endpoint, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro ao gerar produto: ${response.status} ${response.statusText}\n${errorText}`);
            }

            const blob = await response.blob();

            // Tenta obter o nome do ficheiro do header
            const contentDisposition = response.headers.get("Content-Disposition");
            const headerFilename = contentDisposition?.match(/filename="?([^"]+)"?/)?.[1];
            const fallbackFilename = response.headers.get("X-Filename") || "output.pdf";

            const filename = headerFilename || fallbackFilename;

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);

            setFeedback({
                message: "Produto gerado!",
                status: "success",
            });
        } catch (error) {
            console.error(error);
            setFeedback({
                message: error instanceof Error ? error.message : "Processing failure",
                status: "danger",
            });
        } finally {
            setBtnSubmit({
                value: "Gerar Produto",
                disabled: false,
            });
        }
    };

    return (
        <div id="generate-pdf-page">
            <div id="sub-header">
                <h1>Gerador do Produto</h1>
            </div>

            <div className="container-fluid">
                <form onSubmit={handleResize}>
                    <div className="mb-3">
                        <ImageUploader onChange={setImages} />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="title" className="form-label">
                            Título
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="description" className="form-label">
                            Descrição
                        </label>
                        <textarea
                            className="form-control"
                            id="description"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                    </div>

                    <ButtonSubmit disabled={btnSumbit.disabled} description={btnSumbit.value} />
                </form>

                <EndpointFeedback status={feedback.status} description={feedback.message} />
            </div>
        </div>
    );
};

export default GenerateProduct;
