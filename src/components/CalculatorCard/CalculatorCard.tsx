import React from 'react';
import './CalculatorCard.css';

interface CalculatorCardProps {
  label: string;
  children: React.ReactNode;
  className?: string;
  tooltip?: React.ReactNode;
}

/**
 * Card-based layout component for mobile view
 * Transforms table rows into cards with label-value pairs
 */
const CalculatorCard: React.FC<CalculatorCardProps> = ({
  label,
  children,
  className = '',
  tooltip
}) => {
  return (
    <div className={`calculator-card ${className}`}>
      <div className="calculator-card-label">
        {tooltip || label}
      </div>
      <div className="calculator-card-value">
        {children}
      </div>
    </div>
  );
};

export default CalculatorCard;
