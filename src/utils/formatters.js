// Centralized Indonesian Formatting Utilities for TIRTA Dashboard
// Formats all decimals strictly into x,xx format (2 decimal places with Indonesian comma separator)

/**
 * Format any numeric value as x,xx (e.g. 1.234,56 or 12,30 or 0,00)
 */
export function formatDecimal(value, digits = 2) {
  if (value === undefined || value === null || isNaN(value)) return '0,00';
  const num = Number(value);
  return num.toLocaleString('id-ID', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/**
 * Format numeric value as Indonesian Rupiah with 2 decimal places: Rp 12.500,00
 */
export function formatRupiah(value, digits = 2) {
  if (value === undefined || value === null || isNaN(value)) return 'Rp 0,00';
  const num = Number(value);
  return `Rp ${num.toLocaleString('id-ID', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

/**
 * Format percentage as x,xx%: 12,50%
 */
export function formatPercent(value, digits = 2) {
  if (value === undefined || value === null || isNaN(value)) return '0,00%';
  const num = Number(value);
  return `${num.toLocaleString('id-ID', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}%`;
}
