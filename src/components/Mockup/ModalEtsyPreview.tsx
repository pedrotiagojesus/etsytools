import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { renderElementAsSquareThumbnail } from "../../utils/cropToSquare";
import "./ModalEtsyPreview.css";

interface ModalEtsyPreviewProps {
    previewContentId: string;
}

type ViewMode = "desktop" | "mobile";

const FAKE_LISTINGS = [
    { title: "Woodland Animals Coloring Book", price: "€3,50", shop: "PixelCraftShop" },
    { title: "Ocean Life Printable Pages", price: "€4,20", shop: "InkAndPaperCo" },
    { title: "Mandala Relaxation Set", price: "€2,90", shop: "CalmCanvasDesigns" },
    { title: "Dinosaur Adventure Pack", price: "€5,00", shop: "LittleDoodleStudio" },
    { title: "Flower Garden Coloring", price: "€3,80", shop: "BloomAndInk" },
];

const ModalEtsyPreview: React.FC<ModalEtsyPreviewProps> = ({
    previewContentId,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>("desktop");
    const [title, setTitle] = useState(
        "Summer Coloring Book | 25 Printable Pages | Instant Download PDF",
    );
    const [price, setPrice] = useState("€4,50");
    const [shop, setShop] = useState("ATuaLoja");
    const [position, setPosition] = useState(2);

    useEffect(() => {
        const modal = document.getElementById("modal-etsy-preview");
        const handleShow = () => setIsModalOpen(true);
        const handleHide = () => setIsModalOpen(false);
        modal?.addEventListener("shown.bs.modal", handleShow);
        modal?.addEventListener("hidden.bs.modal", handleHide);
        return () => {
            modal?.removeEventListener("shown.bs.modal", handleShow);
            modal?.removeEventListener("hidden.bs.modal", handleHide);
        };
    }, []);

    useEffect(() => {
        if (!isModalOpen) return;

        (async () => {
            setIsLoading(true);
            setError(null);
            try {
                // pequeno delay para garantir que o modal já renderizou o elemento
                await new Promise((r) => setTimeout(r, 50));
                const dataUrl = await renderElementAsSquareThumbnail(
                    previewContentId,
                );
                setThumbnail(dataUrl);
            } catch (err) {
                console.error(err);
                setError("Não foi possível gerar a pré-visualização.");
            } finally {
                setIsLoading(false);
            }
        })();
    }, [isModalOpen, previewContentId]);

    const cards = FAKE_LISTINGS.slice(0, 5).map((listing, i) => ({
        ...listing,
        isOwn: false,
        key: `fake-${i}`,
    }));
    cards.splice(position, 0, {
        title,
        price,
        shop,
        isOwn: true,
        key: "own",
    });

    const modalContent = (
        <div className="modal" id="modal-etsy-preview">
            <div className="modal-dialog modal-xl modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5">
                            Simular listagem no Etsy
                        </h1>
                        <button
                            type="button"
                            className="btn-close btn-close-white"
                            data-bs-dismiss="modal"
                            aria-label="Fechar"
                        ></button>
                    </div>

                    <div className="modal-body">
                        <div className="row g-3 mb-4">
                            <div className="col-md-6">
                                <label className="form-label">
                                    Título do anúncio
                                </label>
                                <input
                                    className="form-control"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Preço</label>
                                <input
                                    className="form-control"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Loja</label>
                                <input
                                    className="form-control"
                                    value={shop}
                                    onChange={(e) => setShop(e.target.value)}
                                />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">
                                    Posição na grelha
                                </label>
                                <select
                                    className="form-select"
                                    value={position}
                                    onChange={(e) =>
                                        setPosition(Number(e.target.value))
                                    }
                                >
                                    {[0, 1, 2, 3, 4, 5].map((p) => (
                                        <option key={p} value={p}>
                                            {p + 1}ª
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div
                            className="btn-group mb-4"
                            role="group"
                            aria-label="Modo de visualização"
                        >
                            <button
                                type="button"
                                className={`btn ${
                                    viewMode === "desktop"
                                        ? "btn-primary"
                                        : "btn-outline-primary"
                                }`}
                                onClick={() => setViewMode("desktop")}
                            >
                                <i
                                    className="bi bi-display"
                                    aria-hidden="true"
                                ></i>{" "}
                                Desktop
                            </button>
                            <button
                                type="button"
                                className={`btn ${
                                    viewMode === "mobile"
                                        ? "btn-primary"
                                        : "btn-outline-primary"
                                }`}
                                onClick={() => setViewMode("mobile")}
                            >
                                <i
                                    className="bi bi-phone"
                                    aria-hidden="true"
                                ></i>{" "}
                                Mobile
                            </button>
                        </div>

                        {isLoading && (
                            <div className="text-center py-5">
                                <div
                                    className="spinner-border"
                                    role="status"
                                >
                                    <span className="visually-hidden">
                                        A gerar pré-visualização...
                                    </span>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="alert alert-danger">{error}</div>
                        )}

                        {!isLoading && !error && (
                            <div
                                className={`etsy-search-grid etsy-search-grid-${viewMode}`}
                            >
                                {cards.map((card) => (
                                    <div
                                        key={card.key}
                                        // className={`etsy-card ${
                                        //     card.isOwn ? "etsy-card-own" : ""
                                        // }`}
                                    >
                                        <div className="etsy-card-image">
                                            {card.isOwn && thumbnail ? (
                                                <img
                                                    src={thumbnail}
                                                    alt="Pré-visualização do teu anúncio"
                                                />
                                            ) : (
                                                <div className="etsy-card-placeholder">
                                                    <i
                                                        className="bi bi-image"
                                                        aria-hidden="true"
                                                    ></i>
                                                </div>
                                            )}
                                            {/* {card.isOwn && (
                                                <span className="etsy-card-own-badge">
                                                    O TEU ANÚNCIO
                                                </span>
                                            )} */}
                                        </div>
                                        <div className="etsy-card-info">
                                            <p className="etsy-card-title">
                                                {card.title}
                                            </p>
                                            <p className="etsy-card-shop">
                                                {card.shop}
                                            </p>
                                            <p className="etsy-card-price">
                                                {card.price}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-primary"
                            data-bs-dismiss="modal"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default ModalEtsyPreview;