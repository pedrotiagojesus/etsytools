import React from 'react';
import './CalculatorSkeleton.css';

const CalculatorSkeleton: React.FC = () => {
    return (
        <div id="calculator-page">
            <div id="sub-header">
                <div className="skeleton skeleton-title"></div>
            </div>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-8">
                        <div className="skeleton skeleton-heading"></div>
                        <table className="table table-sm table-striped align-middle mb-0">
                            <tbody>
                                {/* 7 rows to match the Calculator table */}
                                {[...Array(7)].map((_, index) => (
                                    <tr key={index}>
                                        <th style={{ width: '40%' }}>
                                            <div className="skeleton skeleton-text"></div>
                                        </th>
                                        <td>
                                            <div className="skeleton skeleton-input"></div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="col-md-4">
                        <div className="skeleton skeleton-heading"></div>
                        <table className="table table-sm table-striped align-middle mb-0">
                            <tbody>
                                {/* Header row */}
                                <tr>
                                    <th></th>
                                    <th>
                                        <div className="skeleton skeleton-text-sm"></div>
                                    </th>
                                    <th>
                                        <div className="skeleton skeleton-text-sm"></div>
                                    </th>
                                </tr>
                                {/* 3 data rows to match the rates table */}
                                {[...Array(3)].map((_, index) => (
                                    <tr key={index}>
                                        <th style={{ width: '40%' }}>
                                            <div className="skeleton skeleton-text"></div>
                                        </th>
                                        <td>
                                            <div className="skeleton skeleton-input-sm"></div>
                                        </td>
                                        <td>
                                            <div className="skeleton skeleton-input-sm"></div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalculatorSkeleton;
