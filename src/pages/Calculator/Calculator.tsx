import { useEffect, useState } from "react";

// CSS
import "./Calculator.css";

function Calculator() {

    const COMMISSION_PER_ADVERTISEMENT = 0.19; // Taxa de anúncio
    const COMMISSION_TRANSACTION = 6.5; // Taxa de transação
    const FIXED_PAYMENT_PROCESSING_COMMISSION = 0.3; // Taxa de P.Pagamento Fixo
    const VARIABLE_PAYMENT_PROCESSING_COMMISSION = 4; // Taxa de P.Pagamento Variável

    const [rate, setRate] = useState({
        advertisement: COMMISSION_PER_ADVERTISEMENT,
        transaction: COMMISSION_TRANSACTION,
        fixedPaymentProcessing: FIXED_PAYMENT_PROCESSING_COMMISSION,
        variablePaymentProcessing: VARIABLE_PAYMENT_PROCESSING_COMMISSION,
        paymentProcessing: 0,
    });

    const [profitMargin, setProfitMargin] = useState({
        transactionRateResult: 0,
        paymentProcessingRateResult: 0,
        profit: 0,
    });

    // Estado para armazenar o preço de venda, desconto e o lucro calculado
    const [precoVenda, setPrecoVenda] = useState<string>("");
    const [precoComDesconto, setPrecoComDesconto] = useState<number>(0);
    const [desconto, setDesconto] = useState<number>(0);

    // Função para calcular o lucro
    const calculateProfit = () => {
        const preco = Number(precoVenda);
        const descontoPercentual = desconto;

        // Aplicar o desconto ao preço de venda
        const valPrecoComDesconto = preco * (1 - descontoPercentual / 100);
        setPrecoComDesconto(valPrecoComDesconto);

        // Taxa de transação
        setProfitMargin({
            ...profitMargin,
            transactionRateResult: (rate.transaction / 100) * valPrecoComDesconto,
        });

        // Taxa de processamento
        setProfitMargin({
            ...profitMargin,
            paymentProcessingRateResult:
                (rate.variablePaymentProcessing / 100) * valPrecoComDesconto + rate.fixedPaymentProcessing,
        });

        // Atualiza o estado com o lucro calculado
        setProfitMargin({
            ...profitMargin,
            profit:
                valPrecoComDesconto -
                (rate.advertisement +
                    (rate.transaction / 100) * valPrecoComDesconto +
                    ((rate.variablePaymentProcessing / 100) * valPrecoComDesconto + rate.fixedPaymentProcessing)),
        });
    };

    useEffect(() => {
        calculateProfit();
    }, [precoVenda, desconto, rate]);

    return (
        <div id="calculator-page">
            <div id="sub-header">
                <h1>Calculadora</h1>
            </div>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-8">
                        <h3>Calcular margem de lucro</h3>
                        <table className="table table-sm table-striped align-middle mb-0">
                            <tbody>
                                <tr>
                                    <th>Preço de Venda (€)</th>
                                    <td>
                                        <div className="input-group">
                                            <input
                                                className="form-control"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={precoVenda}
                                                onChange={(e) => {
                                                    setPrecoVenda(e.target.value);
                                                }}
                                            />
                                            <span className="input-group-text">€</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <th>Desconto</th>
                                    <td>
                                        <div className="input-group">
                                            <input
                                                className="form-control desconto-input"
                                                type="number"
                                                step="1"
                                                min="0"
                                                max="100"
                                                value={desconto}
                                                onChange={(e) => setDesconto(parseFloat(e.target.value) || 0)}
                                            />
                                            <span className="input-group-text">%</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <th>Preço com desconto</th>
                                    <td>
                                        <div className="input-group">
                                            <input
                                                className="form-control"
                                                type="number"
                                                value={precoComDesconto.toFixed(2)}
                                                readOnly
                                            />
                                            <span className="input-group-text">€</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <th>Comissão de Processamento de Pagamento</th>
                                    <td>
                                        <div className="input-group">
                                            <input
                                                className="form-control"
                                                value={profitMargin.paymentProcessingRateResult.toFixed(2)}
                                                readOnly
                                            />
                                            <span className="input-group-text">€</span>
                                        </div>
                                    </td>
                                </tr>

                                <tr>
                                    <th>Comissão de Transação</th>
                                    <td>
                                        <div className="input-group">
                                            <input
                                                className="form-control"
                                                value={profitMargin.transactionRateResult.toFixed(2)}
                                                readOnly
                                            />
                                            <span className="input-group-text">€</span>
                                        </div>
                                    </td>
                                </tr>

                                <tr>
                                    <th>Comissão do anuncio</th>
                                    <td>
                                        <div className="input-group">
                                            <input className="form-control" value={rate.advertisement} readOnly />
                                            <span className="input-group-text">€</span>
                                        </div>
                                    </td>
                                </tr>

                                <tr
                                    className={`last-table-row ${
                                        profitMargin.profit < 0 ? "table-danger" : "table-success"
                                    }`}
                                >
                                    <th>Lucro</th>
                                    <td>
                                        <div className="input-group">
                                            <input
                                                className="form-control lucro-resultado"
                                                value={profitMargin.profit.toFixed(2)}
                                                readOnly
                                            />
                                            <span className="input-group-text">€</span>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="col-md-4">
                        <h3>Comissões e impostos</h3>
                        <table className="table table-sm table-striped align-middle mb-0">
                            <tbody>
                                <tr>
                                    <th></th>
                                    <th>Componente Variavel</th>
                                    <th>Componente Fixa</th>
                                </tr>
                                <tr>
                                    <th>Taxa de P.Pagamento</th>
                                    <td>
                                        <div className="input-group">
                                            <input
                                                className="form-control"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={rate.variablePaymentProcessing}
                                                onChange={(e) => {
                                                    setRate({
                                                        ...rate,
                                                        variablePaymentProcessing: parseFloat(e.target.value) || 0,
                                                    });
                                                }}
                                            />
                                            <span className="input-group-text">%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="input-group">
                                            <input
                                                className="form-control"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={rate.fixedPaymentProcessing}
                                                onChange={(e) => {
                                                    setRate({
                                                        ...rate,
                                                        fixedPaymentProcessing: parseFloat(e.target.value) || 0,
                                                    });
                                                }}
                                            />
                                            <span className="input-group-text">€</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <th>Taxa de transação</th>
                                    <td>
                                        <div className="input-group">
                                            <input
                                                className="form-control"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={rate.transaction}
                                                onChange={(e) => {
                                                    setRate({
                                                        ...rate,
                                                        transaction: parseFloat(e.target.value) || 0,
                                                    });
                                                }}
                                            />
                                            <span className="input-group-text">%</span>
                                        </div>
                                    </td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <th>Taxa de anúncio</th>
                                    <td></td>
                                    <td>
                                        <div className="input-group">
                                            <input
                                                className="form-control"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={rate.advertisement}
                                                onChange={(e) => {
                                                    setRate({
                                                        ...rate,
                                                        advertisement: parseFloat(e.target.value) || 0,
                                                    });
                                                }}
                                            />
                                            <span className="input-group-text">€</span>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Calculator;
