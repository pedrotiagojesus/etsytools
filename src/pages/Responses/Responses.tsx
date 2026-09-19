// CSS
import "./Responses.css";

// Hooks
import { useCannedResponses } from "@hooks/useCannedResponses";
import { useToast } from "@hooks/useToast";

const Responses = () => {
    const { responses, addResponse, updateResponse, removeResponse, resetToDefaults } = useCannedResponses();
    const { showSuccess, showError } = useToast();

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            showSuccess("Resposta copiada!");
        } catch (err) {
            console.error(err);
            showError("Não foi possível copiar. Copia manualmente.");
        }
    };

    const handleReset = () => {
        if (window.confirm("Repor as respostas predefinidas? Isto substitui todas as edições atuais.")) {
            resetToDefaults();
        }
    };

    return (
        <div id="responses-page">
            <div id="sub-header">
                <h1>Respostas Prontas</h1>
            </div>

            <div className="container-fluid">
                <p className="text-muted">
                    Biblioteca de respostas para perguntas frequentes de compradores — edita à vontade, fica guardado
                    neste browser. O texto vem em inglês (é a língua em que a ficha do Etsy vende), mas podes mudar
                    livremente.
                </p>

                <div className="responses-toolbar">
                    <button type="button" className="btn btn-primary" onClick={addResponse}>
                        <i className="bi bi-plus-lg" aria-hidden="true"></i> Adicionar pergunta
                    </button>
                    <button type="button" className="btn btn-outline-secondary" onClick={handleReset}>
                        Repor predefinições
                    </button>
                </div>

                {responses.map((response) => (
                    <div className="response-card" key={response.id}>
                        <div className="response-card-header">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Pergunta"
                                value={response.question}
                                onChange={(e) => updateResponse(response.id, { question: e.target.value })}
                                aria-label="Pergunta"
                            />
                            <button
                                type="button"
                                className="btn btn-sm btn-transparent text-danger"
                                onClick={() => removeResponse(response.id)}
                                aria-label={`Remover pergunta "${response.question || "sem título"}"`}
                            >
                                <i className="bi bi-trash" aria-hidden="true"></i>
                            </button>
                        </div>

                        <textarea
                            className="form-control"
                            rows={3}
                            placeholder="Resposta"
                            value={response.answer}
                            onChange={(e) => updateResponse(response.id, { answer: e.target.value })}
                            aria-label="Resposta"
                        ></textarea>

                        <div className="response-card-actions">
                            <button
                                type="button"
                                className="btn btn-sm btn-transparent"
                                onClick={() => copyToClipboard(response.answer)}
                            >
                                <i className="bi bi-clipboard" aria-hidden="true"></i> Copiar resposta
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Responses;
