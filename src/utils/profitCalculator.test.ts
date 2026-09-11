import { describe, expect, it } from "vitest";
import { calculateProfit, type EtsyRates } from "./profitCalculator";

const rate: EtsyRates = {
    advertisement: 0.19,
    transaction: 6.5,
    fixedPaymentProcessing: 0.3,
    variablePaymentProcessing: 4,
};

describe("calculateProfit", () => {
    it("aplica o desconto ao preço de venda", () => {
        const result = calculateProfit(100, 10, rate);
        expect(result.precoComDesconto).toBeCloseTo(90);
    });

    it("calcula a taxa de transação sobre o preço já com desconto", () => {
        const result = calculateProfit(100, 0, rate);
        expect(result.transactionRateResult).toBeCloseTo(6.5);
    });

    it("calcula a taxa de processamento de pagamento (fixa + variável)", () => {
        const result = calculateProfit(100, 0, rate);
        // 4% de 100 + 0.30 fixo
        expect(result.paymentProcessingRateResult).toBeCloseTo(4.3);
    });

    it("subtrai publicidade, transação e processamento do preço com desconto", () => {
        const result = calculateProfit(100, 0, rate);
        // 100 - (0.19 + 6.5 + 4.3)
        expect(result.profit).toBeCloseTo(89.01);
    });

    it("sem desconto, precoComDesconto == precoVenda", () => {
        const result = calculateProfit(50, 0, rate);
        expect(result.precoComDesconto).toBe(50);
    });

    it("com 100% de desconto, todos os valores derivados são zero e o lucro é negativo pelo fixo", () => {
        const result = calculateProfit(100, 100, rate);
        expect(result.precoComDesconto).toBe(0);
        expect(result.transactionRateResult).toBe(0);
        expect(result.paymentProcessingRateResult).toBeCloseTo(0.3);
        expect(result.profit).toBeCloseTo(-0.49);
    });
});
