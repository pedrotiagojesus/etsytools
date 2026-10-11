export interface EtsyRates {
    advertisement: number;
    transaction: number;
    fixedPaymentProcessing: number;
    variablePaymentProcessing: number;
}

export interface ProfitResult {
    precoComDesconto: number;
    transactionRateResult: number;
    paymentProcessingRateResult: number;
    profit: number;
}

export function calculateProfit(precoVenda: number, desconto: number, rate: EtsyRates): ProfitResult {
    const precoComDesconto = precoVenda * (1 - desconto / 100);

    const transactionRateResult = (rate.transaction / 100) * precoComDesconto;
    const paymentProcessingRateResult =
        (rate.variablePaymentProcessing / 100) * precoComDesconto + rate.fixedPaymentProcessing;

    const profit = precoComDesconto - (rate.advertisement + transactionRateResult + paymentProcessingRateResult);

    return { precoComDesconto, transactionRateResult, paymentProcessingRateResult, profit };
}
