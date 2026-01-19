import numeral from 'numeral'

export const formatCurrency = (value, currencySymbol = '฿', format = '0,0.00') => {
  if (value < 0) {
    return `-${currencySymbol}${numeral(Math.abs(value)).format(format)}`
  }
  return `${currencySymbol}${numeral(value).format(format)}`
}
