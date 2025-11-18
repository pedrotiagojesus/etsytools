export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Validates a price value
 * - Must be non-negative
 * - Maximum 2 decimal places
 * - Maximum value: 999999.99
 */
export function validatePrice(value: string | number): ValidationResult {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  // Check if empty or not a number
  if (value === '' || value === null || value === undefined) {
    return { isValid: true }; // Empty is valid (optional field)
  }

  if (isNaN(numValue)) {
    return { isValid: false, message: 'Valor inválido' };
  }

  // Check if negative
  if (numValue < 0) {
    return { isValid: false, message: 'O valor não pode ser negativo' };
  }

  // Check maximum value
  if (numValue > 999999.99) {
    return { isValid: false, message: 'O valor máximo é 999999.99' };
  }

  // Check decimal places
  const decimalPlaces = (numValue.toString().split('.')[1] || '').length;
  if (decimalPlaces > 2) {
    return { isValid: false, message: 'Máximo de 2 casas decimais' };
  }

  return { isValid: true };
}

/**
 * Validates a discount percentage value
 * - Must be between 0 and 100
 * - Integer values only
 */
export function validateDiscount(value: string | number): ValidationResult {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  // Check if empty or not a number
  if (value === '' || value === null || value === undefined) {
    return { isValid: true }; // Empty is valid (optional field)
  }

  if (isNaN(numValue)) {
    return { isValid: false, message: 'Valor inválido' };
  }

  // Check range
  if (numValue < 0 || numValue > 100) {
    return { isValid: false, message: 'O desconto deve estar entre 0 e 100' };
  }

  // Check if integer
  if (!Number.isInteger(numValue)) {
    return { isValid: false, message: 'O desconto deve ser um número inteiro' };
  }

  return { isValid: true };
}
