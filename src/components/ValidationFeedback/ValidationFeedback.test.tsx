import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ValidationFeedback from "./ValidationFeedback";

describe("ValidationFeedback", () => {
    it("mostra a mensagem de erro quando inválido", () => {
        render(<ValidationFeedback isValid={false} message="Campo obrigatório" />);

        expect(screen.getByRole("alert")).toHaveTextContent("Campo obrigatório");
    });

    it("não mostra nada quando inválido mas sem mensagem", () => {
        render(<ValidationFeedback isValid={false} />);

        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("mostra o estado de sucesso quando válido (comportamento por omissão)", () => {
        render(<ValidationFeedback isValid={true} />);

        expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("não mostra nada quando válido e showValidState=false", () => {
        const { container } = render(
            <ValidationFeedback isValid={true} showValidState={false} />,
        );

        expect(container).toBeEmptyDOMElement();
    });
});
