import { useEffect, useState } from "react";
import Tooltip from "../../components/Tooltip/Tooltip";
import ValidationFeedback from "../../components/ValidationFeedback/ValidationFeedback";
import CalculatorCard from "../../components/CalculatorCard/CalculatorCard";
import { validatePrice, validateDiscount } from "../../utils/validation";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import type { ValidationResult } from "../../utils/validation";

// CSS
import "./Calculator.css";

function Calculator() {
    // Detect mobile viewport (< 768px)
    const isMobile = useMediaQuery('(max-width: 767px)');

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

    // Validation states
    const [precoVendaValidation, setPrecoVendaValidation] = useState<ValidationResult>({ isValid: true });
    const [descontoValidation, setDescontoValidation] = useState<ValidationResult>({ isValid: true });
    const [variablePaymentValidation, setVariablePaymentValidation] = useState<ValidationResult>({ isValid: true });
    const [fixedPaymentValidation, setFixedPaymentValidation] = useState<ValidationResult>({ isValid: true });
    const [transactionValidation, setTransactionValidation] = useState<ValidationResult>({ isValid: true });
    const [advertisementValidation, setAdvertisementValidation] = useState<ValidationResult>({ isValid: true });

    // Animation states for value changes
    const [animatePrecoComDesconto, setAnimatePrecoComDesconto] = useState(false);
    const [animatePaymentProcessing, setAnimatePaymentProcessing] = useState(false);
    const [animateTransaction, setAnimateTransaction] = useState(false);
    const [animateProfit, setAnimateProfit] = useState(false);

    // Função para calcular o lucro
    const calculateProfit = () => {
        const preco = Number(precoVenda);
        const descontoPercentual = desconto;

        // Aplicar o desconto ao preço de venda
        const valPrecoComDesconto = preco * (1 - descontoPercentual / 100);
        const prevPrecoComDesconto = precoComDesconto;
        setPrecoComDesconto(valPrecoComDesconto);

        // Trigger animation if value changed
        if (prevPrecoComDesconto !== valPrecoComDesconto && preco > 0) {
            setAnimatePrecoComDesconto(true);
        }

        // Taxa de transação
        const transactionResult = (rate.transaction / 100) * valPrecoComDesconto;
        const prevTransaction = profitMargin.transactionRateResult;

        // Taxa de processamento
        const paymentProcessingResult = (rate.variablePaymentProcessing / 100) * valPrecoComDesconto + rate.fixedPaymentProcessing;
        const prevPaymentProcessing = profitMargin.paymentProcessingRateResult;

        // Atualiza o estado com o lucro calculado
        const calculatedProfit = valPrecoComDesconto -
            (rate.advertisement +
                transactionResult +
                paymentProcessingResult);
        const prevProfit = profitMargin.profit;

        setProfitMargin({
            transactionRateResult: transactionResult,
            paymentProcessingRateResult: paymentProcessingResult,
            profit: calculatedProfit,
        });

        // Trigger animations if values changed
        if (prevTransaction !== transactionResult && preco > 0) {
            setAnimateTransaction(true);
        }
        if (prevPaymentProcessing !== paymentProcessingResult && preco > 0) {
            setAnimatePaymentProcessing(true);
        }
        if (prevProfit !== calculatedProfit && preco > 0) {
            setAnimateProfit(true);
        }
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
                    <div className={isMobile ? "col-12" : "col-md-8"}>
                        <h3>Calcular margem de lucro</h3>
                        {isMobile ? (
                            // Mobile Card Layout
                            <div className="calculator-cards-container">
                                <CalculatorCard
                                    label="Preço de Venda (€)"
                                    tooltip={
                                        <Tooltip content="O preço pelo qual você venderá o produto na Etsy">
                                            <span style={{ cursor: 'help', borderBottom: '1px dotted' }}>
                                                Preço de Venda (€)
                                            </span>
                                        </Tooltip>
                                    }
                                >
                                    <div className="input-group">
                                        <input
                                            className={`form-control input-validated ${
                                                precoVenda ? (precoVendaValidation.isValid ? 'is-valid' : 'is-invalid') : ''
                                            }`}
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={precoVenda}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setPrecoVenda(value);
                                                setPrecoVendaValidation(validatePrice(value));
                                            }}
                                        />
                                        <span className="input-group-text">€</span>
                                    </div>
                                    {precoVenda && (
                                        <ValidationFeedback
                                            isValid={precoVendaValidation.isValid}
                                            message={precoVendaValidation.message}
                                            showValidState={false}
                                        />
                                    )}
                                </CalculatorCard>

                                <CalculatorCard
                                    label="Desconto"
                                    tooltip={
                                        <Tooltip content="Percentual de desconto aplicado ao preço de venda (0-100%)">
                                            <span style={{ cursor: 'help', borderBottom: '1px dotted' }}>
                                                Desconto
                                            </span>
                                        </Tooltip>
                                    }
                                >
                                    <div className="input-group">
                                        <input
                                            className={`form-control desconto-input input-validated ${
                                                desconto !== 0 ? (descontoValidation.isValid ? 'is-valid' : 'is-invalid') : ''
                                            }`}
                                            type="number"
                                            step="1"
                                            min="0"
                                            max="100"
                                            value={desconto}
                                            onChange={(e) => {
                                                const value = parseFloat(e.target.value) || 0;
                                                setDesconto(value);
                                                setDescontoValidation(validateDiscount(value));
                                            }}
                                        />
                                        <span className="input-group-text">%</span>
                                    </div>
                                    {desconto !== 0 && (
                                        <ValidationFeedback
                                            isValid={descontoValidation.isValid}
                                            message={descontoValidation.message}
                                            showValidState={false}
                                        />
                                    )}
                                </CalculatorCard>

                                <CalculatorCard label="Preço com desconto">
                                    <div className="input-group">
                                        <input
                                            className={`form-control calculated-value ${animatePrecoComDesconto ? 'value-changed' : ''}`}
                                            type="number"
                                            value={precoComDesconto.toFixed(2)}
                                            readOnly
                                            onAnimationEnd={() => setAnimatePrecoComDesconto(false)}
                                        />
                                        <span className="input-group-text">€</span>
                                    </div>
                                </CalculatorCard>

                                <CalculatorCard
                                    label="Comissão de Processamento de Pagamento"
                                    tooltip={
                                        <Tooltip content="Taxa cobrada pela Etsy para processar o pagamento do cliente">
                                            <span style={{ cursor: 'help', borderBottom: '1px dotted' }}>
                                                Comissão de Processamento de Pagamento
                                            </span>
                                        </Tooltip>
                                    }
                                >
                                    <div className="input-group">
                                        <input
                                            className={`form-control calculated-value ${animatePaymentProcessing ? 'value-changed' : ''}`}
                                            value={profitMargin.paymentProcessingRateResult.toFixed(2)}
                                            readOnly
                                            onAnimationEnd={() => setAnimatePaymentProcessing(false)}
                                        />
                                        <span className="input-group-text">€</span>
                                    </div>
                                </CalculatorCard>

                                <CalculatorCard
                                    label="Comissão de Transação"
                                    tooltip={
                                        <Tooltip content="Taxa percentual cobrada pela Etsy sobre cada venda realizada">
                                            <span style={{ cursor: 'help', borderBottom: '1px dotted' }}>
                                                Comissão de Transação
                                            </span>
                                        </Tooltip>
                                    }
                                >
                                    <div className="input-group">
                                        <input
                                            className={`form-control calculated-value ${animateTransaction ? 'value-changed' : ''}`}
                                            value={profitMargin.transactionRateResult.toFixed(2)}
                                            readOnly
                                            onAnimationEnd={() => setAnimateTransaction(false)}
                                        />
                                        <span className="input-group-text">€</span>
                                    </div>
                                </CalculatorCard>

                                <CalculatorCard
                                    label="Comissão do anuncio"
                                    tooltip={
                                        <Tooltip content="Taxa fixa cobrada pela Etsy para listar cada produto">
                                            <span style={{ cursor: 'help', borderBottom: '1px dotted' }}>
                                                Comissão do anuncio
                                            </span>
                                        </Tooltip>
                                    }
                                >
                                    <div className="input-group">
                                        <input className="form-control" value={rate.advertisement} readOnly />
                                        <span className="input-group-text">€</span>
                                    </div>
                                </CalculatorCard>

                                <CalculatorCard
                                    label="Lucro"
                                    className={
                                        profitMargin.profit > 0
                                            ? "card-success"
                                            : profitMargin.profit < 0
                                            ? "card-danger"
                                            : "card-warning"
                                    }
                                >
                                    <div className="profit-result-container">
                                        <div className="profit-icon">
                                            {profitMargin.profit > 0 && (
                                                <i className="bi bi-check-circle-fill text-success"></i>
                                            )}
                                            {profitMargin.profit < 0 && (
                                                <i className="bi bi-exclamation-triangle-fill text-danger"></i>
                                            )}
                                            {profitMargin.profit === 0 && (
                                                <i className="bi bi-info-circle-fill text-warning"></i>
                                            )}
                                        </div>
                                        <div className="input-group">
                                            <input
                                                className={`form-control lucro-resultado calculated-value ${animateProfit ? 'value-changed' : ''}`}
                                                value={profitMargin.profit.toFixed(2)}
                                                readOnly
                                                onAnimationEnd={() => setAnimateProfit(false)}
                                            />
                                            <span className="input-group-text">€</span>
                                        </div>
                                    </div>
                                </CalculatorCard>
                            </div>
                        ) : (
                            // Desktop Table Layout
                            <table className="table table-sm table-striped align-middle mb-0">
                                <tbody>
                                    <tr>
                                    <th>
                                        <Tooltip content="O preço pelo qual você venderá o produto na Etsy">
                                            <span style={{ cursor: 'help', borderBottom: '1px dotted' }}>
                                                Preço de Venda (€)
                                            </span>
                                        </Tooltip>
                                    </th>
                                    <td>
                                        <div className="input-group">
                                            <input
                                                className={`form-control input-validated ${
                                                    precoVenda ? (precoVendaValidation.isValid ? 'is-valid' : 'is-invalid') : ''
                                                }`}
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={precoVenda}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setPrecoVenda(value);
                                                    setPrecoVendaValidation(validatePrice(value));
                                                }}
                                            />
                                            <span className="input-group-text">€</span>
                                        </div>
                                        {precoVenda && (
                                            <ValidationFeedback
                                                isValid={precoVendaValidation.isValid}
                                                message={precoVendaValidation.message}
                                                showValidState={false}
                                            />
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <th>
                                        <Tooltip content="Percentual de desconto aplicado ao preço de venda (0-100%)">
                                            <span style={{ cursor: 'help', borderBottom: '1px dotted' }}>
                                                Desconto
                                            </span>
                                        </Tooltip>
                                    </th>
                                    <td>
                                        <div className="input-group">
                                            <input
                                                className={`form-control desconto-input input-validated ${
                                                    desconto !== 0 ? (descontoValidation.isValid ? 'is-valid' : 'is-invalid') : ''
                                                }`}
                                                type="number"
                                                step="1"
                                                min="0"
                                                max="100"
                                                value={desconto}
                                                onChange={(e) => {
                                                    const value = parseFloat(e.target.value) || 0;
                                                    setDesconto(value);
                                                    setDescontoValidation(validateDiscount(value));
                                                }}
                                            />
                                            <span className="input-group-text">%</span>
                                        </div>
                                        {desconto !== 0 && (
                                            <ValidationFeedback
                                                isValid={descontoValidation.isValid}
                                                message={descontoValidation.message}
                                                showValidState={false}
                                            />
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <th>Preço com desconto</th>
                                    <td>
                                        <div className="input-group">
                                            <input
                                                className={`form-control calculated-value ${animatePrecoComDesconto ? 'value-changed' : ''}`}
                                                type="number"
                                                value={precoComDesconto.toFixed(2)}
                                                readOnly
                                                onAnimationEnd={() => setAnimatePrecoComDesconto(false)}
                                            />
                                            <span className="input-group-text">€</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <th>
                                        <Tooltip content="Taxa cobrada pela Etsy para processar o pagamento do cliente">
                                            <span style={{ cursor: 'help', borderBottom: '1px dotted' }}>
                                                Comissão de Processamento de Pagamento
                                            </span>
                                        </Tooltip>
                                    </th>
                                    <td>
                                        <div className="input-group">
                                            <input
                                                className={`form-control calculated-value ${animatePaymentProcessing ? 'value-changed' : ''}`}
                                                value={profitMargin.paymentProcessingRateResult.toFixed(2)}
                                                readOnly
                                                onAnimationEnd={() => setAnimatePaymentProcessing(false)}
                                            />
                                            <span className="input-group-text">€</span>
                                        </div>
                                    </td>
                                </tr>

                                <tr>
                                    <th>
                                        <Tooltip content="Taxa percentual cobrada pela Etsy sobre cada venda realizada">
                                            <span style={{ cursor: 'help', borderBottom: '1px dotted' }}>
                                                Comissão de Transação
                                            </span>
                                        </Tooltip>
                                    </th>
                                    <td>
                                        <div className="input-group">
                                            <input
                                                className={`form-control calculated-value ${animateTransaction ? 'value-changed' : ''}`}
                                                value={profitMargin.transactionRateResult.toFixed(2)}
                                                readOnly
                                                onAnimationEnd={() => setAnimateTransaction(false)}
                                            />
                                            <span className="input-group-text">€</span>
                                        </div>
                                    </td>
                                </tr>

                                <tr>
                                    <th>
                                        <Tooltip content="Taxa fixa cobrada pela Etsy para listar cada produto">
                                            <span style={{ cursor: 'help', borderBottom: '1px dotted' }}>
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

                                <tr
                                    className={`last-table-row ${
                                        profitMargin.profit > 0
                                            ? "table-success"
                                            : profitMargin.profit < 0
                                            ? "table-danger"
                                            : "table-warning"
                                    }`}
                                >
                                    <th>Lucro</th>
                                    <td>
                                        <div className="profit-result-container">
                                            <div className="profit-icon">
                                                {profitMargin.profit > 0 && (
                                                    <i className="bi bi-check-circle-fill text-success"></i>
                                                )}
                                                {profitMargin.profit < 0 && (
                                                    <i className="bi bi-exclamation-triangle-fill text-danger"></i>
                                                )}
                                                {profitMargin.profit === 0 && (
                                                    <i className="bi bi-info-circle-fill text-warning"></i>
                                                )}
                                            </div>
                                            <div className="input-group">
                                                <input
                                                    className={`form-control lucro-resultado calculated-value ${animateProfit ? 'value-changed' : ''}`}
                                                    value={profitMargin.profit.toFixed(2)}
                                                    readOnly
                                                    onAnimationEnd={() => setAnimateProfit(false)}
                                                />
                                                <span className="input-group-text">€</span>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        )}
                    </div>
                    <div className={isMobile ? "col-12 mt-4" : "col-md-4"}>
                        <h3>Comissões e impostos</h3>
                        {isMobile ? (
                            // Mobile Card Layout for Commissions
                            <div className="calculator-cards-container">
                                <CalculatorCard
                                    label="Taxa de P.Pagamento"
                                    tooltip={
                                        <Tooltip content="Taxa de processamento de pagamento: componente variável (%) e fixa (€)">
                                            <span style={{ cursor: 'help', borderBottom: '1px dotted' }}>
                                                Taxa de P.Pagamento
                                            </span>
                                        </Tooltip>
                                    }
                                >
                                    <div className="calculator-card-grid">
                                        <div className="calculator-card-grid-item">
                                            <label>Componente Variável</label>
                                            <div className="input-group">
                                                <input
                                                    className={`form-control input-validated ${
                                                        rate.variablePaymentProcessing !== 0 ? (variablePaymentValidation.isValid ? 'is-valid' : 'is-invalid') : ''
                                                    }`}
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
                                                        setVariablePaymentValidation(validatePrice(value));
                                                    }}
                                                />
                                                <span className="input-group-text">%</span>
                                            </div>
                                            {rate.variablePaymentProcessing !== 0 && (
                                                <ValidationFeedback
                                                    isValid={variablePaymentValidation.isValid}
                                                    message={variablePaymentValidation.message}
                                                    showValidState={false}
                                                />
                                            )}
                                        </div>
                                        <div className="calculator-card-grid-item">
                                            <label>Componente Fixa</label>
                                            <div className="input-group">
                                                <input
                                                    className={`form-control input-validated ${
                                                        rate.fixedPaymentProcessing !== 0 ? (fixedPaymentValidation.isValid ? 'is-valid' : 'is-invalid') : ''
                                                    }`}
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
                                                        setFixedPaymentValidation(validatePrice(value));
                                                    }}
                                                />
                                                <span className="input-group-text">€</span>
                                            </div>
                                            {rate.fixedPaymentProcessing !== 0 && (
                                                <ValidationFeedback
                                                    isValid={fixedPaymentValidation.isValid}
                                                    message={fixedPaymentValidation.message}
                                                    showValidState={false}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </CalculatorCard>

                                <CalculatorCard
                                    label="Taxa de transação"
                                    tooltip={
                                        <Tooltip content="Percentual cobrado pela Etsy sobre o valor da venda">
                                            <span style={{ cursor: 'help', borderBottom: '1px dotted' }}>
                                                Taxa de transação
                                            </span>
                                        </Tooltip>
                                    }
                                >
                                    <div className="calculator-card-grid-item">
                                        <label>Componente Variável</label>
                                        <div className="input-group">
                                            <input
                                                className={`form-control input-validated ${
                                                    rate.transaction !== 0 ? (transactionValidation.isValid ? 'is-valid' : 'is-invalid') : ''
                                                }`}
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
                                                    setTransactionValidation(validatePrice(value));
                                                }}
                                            />
                                            <span className="input-group-text">%</span>
                                        </div>
                                        {rate.transaction !== 0 && (
                                            <ValidationFeedback
                                                isValid={transactionValidation.isValid}
                                                message={transactionValidation.message}
                                                showValidState={false}
                                            />
                                        )}
                                    </div>
                                </CalculatorCard>

                                <CalculatorCard
                                    label="Taxa de anúncio"
                                    tooltip={
                                        <Tooltip content="Valor fixo cobrado pela Etsy para publicar cada anúncio">
                                            <span style={{ cursor: 'help', borderBottom: '1px dotted' }}>
                                                Taxa de anúncio
                                            </span>
                                        </Tooltip>
                                    }
                                >
                                    <div className="calculator-card-grid-item">
                                        <label>Componente Fixa</label>
                                        <div className="input-group">
                                            <input
                                                className={`form-control input-validated ${
                                                    rate.advertisement !== 0 ? (advertisementValidation.isValid ? 'is-valid' : 'is-invalid') : ''
                                                }`}
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
                                                    setAdvertisementValidation(validatePrice(value));
                                                }}
                                            />
                                            <span className="input-group-text">€</span>
                                        </div>
                                        {rate.advertisement !== 0 && (
                                            <ValidationFeedback
                                                isValid={advertisementValidation.isValid}
                                                message={advertisementValidation.message}
                                                showValidState={false}
                                            />
                                        )}
                                    </div>
                                </CalculatorCard>
                            </div>
                        ) : (
                            // Desktop Table Layout for Commissions
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
                                            <span style={{ cursor: 'help', borderBottom: '1px dotted' }}>
                                                Taxa de P.Pagamento
                                            </span>
                                        </Tooltip>
                                    </th>
                                    <td>
                                        <div className="input-group">
                                            <input
                                                className={`form-control input-validated ${
                                                    rate.variablePaymentProcessing !== 0 ? (variablePaymentValidation.isValid ? 'is-valid' : 'is-invalid') : ''
                                                }`}
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
                                                    setVariablePaymentValidation(validatePrice(value));
                                                }}
                                            />
                                            <span className="input-group-text">%</span>
                                        </div>
                                        {rate.variablePaymentProcessing !== 0 && (
                                            <ValidationFeedback
                                                isValid={variablePaymentValidation.isValid}
                                                message={variablePaymentValidation.message}
                                                showValidState={false}
                                            />
                                        )}
                                    </td>
                                    <td>
                                        <div className="input-group">
                                            <input
                                                className={`form-control input-validated ${
                                                    rate.fixedPaymentProcessing !== 0 ? (fixedPaymentValidation.isValid ? 'is-valid' : 'is-invalid') : ''
                                                }`}
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
                                                    setFixedPaymentValidation(validatePrice(value));
                                                }}
                                            />
                                            <span className="input-group-text">€</span>
                                        </div>
                                        {rate.fixedPaymentProcessing !== 0 && (
                                            <ValidationFeedback
                                                isValid={fixedPaymentValidation.isValid}
                                                message={fixedPaymentValidation.message}
                                                showValidState={false}
                                            />
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <th>
                                        <Tooltip content="Percentual cobrado pela Etsy sobre o valor da venda">
                                            <span style={{ cursor: 'help', borderBottom: '1px dotted' }}>
                                                Taxa de transação
                                            </span>
                                        </Tooltip>
                                    </th>
                                    <td>
                                        <div className="input-group">
                                            <input
                                                className={`form-control input-validated ${
                                                    rate.transaction !== 0 ? (transactionValidation.isValid ? 'is-valid' : 'is-invalid') : ''
                                                }`}
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
                                                    setTransactionValidation(validatePrice(value));
                                                }}
                                            />
                                            <span className="input-group-text">%</span>
                                        </div>
                                        {rate.transaction !== 0 && (
                                            <ValidationFeedback
                                                isValid={transactionValidation.isValid}
                                                message={transactionValidation.message}
                                                showValidState={false}
                                            />
                                        )}
                                    </td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <th>
                                        <Tooltip content="Valor fixo cobrado pela Etsy para publicar cada anúncio">
                                            <span style={{ cursor: 'help', borderBottom: '1px dotted' }}>
                                                Taxa de anúncio
                                            </span>
                                        </Tooltip>
                                    </th>
                                    <td></td>
                                    <td>
                                        <div className="input-group">
                                            <input
                                                className={`form-control input-validated ${
                                                    rate.advertisement !== 0 ? (advertisementValidation.isValid ? 'is-valid' : 'is-invalid') : ''
                                                }`}
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
                                                    setAdvertisementValidation(validatePrice(value));
                                                }}
                                            />
                                            <span className="input-group-text">€</span>
                                        </div>
                                        {rate.advertisement !== 0 && (
                                            <ValidationFeedback
                                                isValid={advertisementValidation.isValid}
                                                message={advertisementValidation.message}
                                                showValidState={false}
                                            />
                                        )}
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Calculator;
