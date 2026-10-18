import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import EtsyThumbnailPreview from "./EtsyThumbnailPreview";

interface ModalEtsyThumbnailProps {
    previewHtml: string;
    previewCss: string;
}

const ModalEtsyThumbnail: React.FC<ModalEtsyThumbnailProps> = ({ previewHtml, previewCss }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const modal = document.getElementById("modal-etsy-thumbnail");
        const handleShow = () => setIsModalOpen(true);
        const handleHide = () => setIsModalOpen(false);
        modal?.addEventListener("shown.bs.modal", handleShow);
        modal?.addEventListener("hidden.bs.modal", handleHide);
        return () => {
            modal?.removeEventListener("shown.bs.modal", handleShow);
            modal?.removeEventListener("hidden.bs.modal", handleHide);
        };
    }, []);

    const modalContent = (
        <div className="modal" id="modal-etsy-thumbnail">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5">Pré-visualização na grelha de pesquisa do Etsy</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                    </div>

                    <div className="modal-body">
                        {isModalOpen && (
                            <EtsyThumbnailPreview previewHtml={previewHtml} previewCss={previewCss} />
                        )}
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-primary" data-bs-dismiss="modal">
                            Fechar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default ModalEtsyThumbnail;
