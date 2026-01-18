import numeral from 'numeral'

/**
 * Format currency with proper negative sign placement
 * @param {number} value - The amount to format
 * @param {string} currencySymbol - Currency symbol (e.g., '฿', '$')
 * @param {string} format - Numeral format string (default: '0,0.00')
 * @returns {string} Formatted currency string (e.g., '-฿1,000.00' or '฿1,000.00')
 */
export const formatCurrency = (value, currencySymbol = '฿', format = '0,0.00') => {
  if (value < 0) {
    return `-${currencySymbol}${numeral(Math.abs(value)).format(format)}`
  }
  return `${currencySymbol}${numeral(value).format(format)}`
}
