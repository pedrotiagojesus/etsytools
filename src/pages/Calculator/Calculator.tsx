import { useEffect, useState, useRef } from "react";
import Tooltip from "@components/Tooltip/Tooltip";

// CSS
import "./Calculator.css";
import { calculateProfit } from "@utils/profitCalculator";

function Calculator() {
    const COMMISSION_PER_ADVERTISEMENT = 0.19;
    const COMMISSION_TRANSACTION = 6.5;
    const FIXED_PAYMENT_PROCESSING_COMMISSION = 0.3;
    const VARIABLE_PAYMENT_PROCESSING_COMMISSION = 4;

    const [rate, setRate] = useState({
        advertisement: COMMISSION_PER_ADVERTISEMENT,
        transaction: COMMISSION_TRANSACTION,
        fixedPaymentProcessing: FIXED_PAYMENT_PROCESSING_COMMISSION,
        variablePaymentProcessing: VARIABLE_PAYMENT_PROCESSING_COMMISSION,
        paymentProcessing: 0,
    });

    const [profitMargin, setProfitMargin] = useState(0);

    const [precoVenda, setPrecoVenda] = useState<number>(0);
    const [precoComDesconto, setPrecoComDesconto] = useState<number>(0);
    const [desconto, setDesconto] = useState<number>(0);

    const debounceTimer = useRef<number | null>(null);

    useEffect(() => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = window.setTimeout(() => {
            const result = calculateProfit(precoVenda, desconto, rate);
            setProfitMargin(result.profit);
            setPrecoComDesconto(result.precoComDesconto);
        }, 200);

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
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
                                    <th>
                                        <Tooltip content="O preço pelo qual você venderá o produto na Etsy">
                                            <span
                                                style={{
                                                    cursor: "help",
                                                    borderBottom: "1px dotted",
                                                }}
                                            >
                                                Preço de Venda (€)
                                            </span>
                                        </Tooltip>
                                    </th>
                                    <td>
                                        <div className="input-group">
                                            <input
                                                className="form-control input-validated"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={precoVenda}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setPrecoVenda(Number(value));
                                                }}
                                            />
                                            <span className="input-group-text">€</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <th>
                                        <Tooltip content="Percentual de desconto aplicado ao preço de venda (0-100%)">
                                            <span
                                                style={{
                                                    cursor: "help",
                                                    borderBottom: "1px dotted",
                                                }}
                                            >
                                                Desconto
                                            </span>
                                        </Tooltip>
                                    </th>
                                    <td>
                                        <div className="input-group">
                                            <input
                                                className="form-control desconto-input input-validated"
                                                type="number"
                                                step="1"
                                                min="0"
                                                max="100"
                                                value={desconto}
                                                onChange={(e) => {
                                                    const value = parseFloat(e.target.value) || 0;
                                                    setDesconto(value);
                                                }}
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
                                                className="form-control calculated-value"
                                                type="number"
                                                value={precoComDesconto.toFixed(2)}
                                                readOnly
                                            />
                                            <span className="input-group-text">€</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <th>
                                        <Tooltip content="Taxa cobrada pela Etsy para processar o pagamento do cliente">
                                            <span
                                                style={{
                                                    cursor: "help",
                                                    borderBottom: "1px dotted",
                                                }}
                                            >
                                                Comissão de Processamento de Pagamento
                                            </span>
                                        </Tooltip>
                                    </th>
                                    <td>
                                        <div className="input-group">
                                            <input
                                                className="form-control calculated-value"
                                                value={profitMargin.toFixed(2)}
                                                readOnly
                                            />
                                            <span className="input-group-text">€</span>
                                        </div>
                                    </td>
                                </tr>

                                <tr>
                                    <th>
                                        <Tooltip content="Taxa percentual cobrada pela Etsy sobre cada venda realizada">
                                            <span
                                                style={{
                                                    cursor: "help",
                                                    borderBottom: "1px dotted",
                                                }}
                                            >
                                                Comissão de Transação
                                            </span>
                                        </Tooltip>
                                    </th>
                                    <td>
                                        <div className="input-group">
                                            <input
                                                className="form-control calculated-value"
                                                value={profitMargin.toFixed(2)}
                                                readOnly
                                            />
                                            <span className="input-group-text">€</span>
                                        </div>
                                    </td>
                                </tr>

                                <tr>
                                    <th>
                                        <Tooltip content="Taxa fixa cobrada pela Etsy para listar cada produto">
                                            <span
                                                style={{
                                                    cursor: "help",
                                                    borderBottom: "1px dotted",
                                                }}
                                            >
                                                Comissão do anuncio
                                            </span>
                                        </Tooltip>
                                    </th>
                                    <td>
                                        <div className="input-group">
                                            <input className="form-control" value={rate.advertisement} readOnly />
                                            <span className="input-group-text">€</span>
                                        </div>
                                    </td>
                                </tr>

                                <tr className={`last-table-row`}>
                                    <th>Lucro</th>
                                    <td>
                                        <div className="profit-result-container">
                                            <div className="input-group">
                                                <input
                                                    className="form-control lucro-resultado calculated-value"
                                                    value={profitMargin.toFixed(2)}
                                                    readOnly
                                                />
                                                <span className="input-group-text">€</span>
                                            </div>
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
                                    <th>
                                        <Tooltip content="Taxa de processamento de pagamento: componente variável (%) e fixa (€)">
                                            <span
                                                style={{
                                                    cursor: "help",
                                                    borderBottom: "1px dotted",
                                                }}
                                            >
                                                Taxa de P.Pagamento
                                            </span>
                                        </Tooltip>
                                    </th>
                                    <td>
                                        <div className="input-group">
                                            <input
                                                className="form-control input-validated"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={rate.variablePaymentProcessing}
                                                onChange={(e) => {
                                                    const value = parseFloat(e.target.value) || 0;
                                                    setRate({
                                                        ...rate,
                                                        variablePaymentProcessing: value,
                                                    });
                                                }}
                                            />
                                            <span className="input-group-text">%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="input-group">
                                            <input
                                                className="form-control input-validated"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={rate.fixedPaymentProcessing}
                                                onChange={(e) => {
                                                    const value = parseFloat(e.target.value) || 0;
                                                    setRate({
                                                        ...rate,
                                                        fixedPaymentProcessing: value,
                                                    });
                                                }}
                                            />
                                            <span className="input-group-text">€</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <th>
                                        <Tooltip content="Percentual cobrado pela Etsy sobre o valor da venda">
                                            <span
                                                style={{
                                                    cursor: "help",
                                                    borderBottom: "1px dotted",
                                                }}
                                            >
                                                Taxa de transação
                                            </span>
                                        </Tooltip>
                                    </th>
                                    <td>
                                        <div className="input-group">
                                            <input
                                                className="form-control input-validated"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={rate.transaction}
                                                onChange={(e) => {
                                                    const value = parseFloat(e.target.value) || 0;
                                                    setRate({
                                                        ...rate,
                                                        transaction: value,
                                                    });
                                                }}
                                            />
                                            <span className="input-group-text">%</span>
                                        </div>
                                    </td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <th>
                                        <Tooltip content="Valor fixo cobrado pela Etsy para publicar cada anúncio">
                                            <span
                                                style={{
                                                    cursor: "help",
                                                    borderBottom: "1px dotted",
                                                }}
                                            >
                                                Taxa de anúncio
                                            </span>
                                        </Tooltip>
                                    </th>
                                    <td></td>
                                    <td>
                                        <div className="input-group">
                                            <input
                                                className="form-control input-validated"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={rate.advertisement}
                                                onChange={(e) => {
                                                    const value = parseFloat(e.target.value) || 0;
                                                    setRate({
                                                        ...rate,
                                                        advertisement: value,
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
