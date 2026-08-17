/**
 * Format số thành tiền VND.
 * @example formatCurrency(125000) → "125.000 ₫"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format số thành tiền VND compact (không có ký hiệu tiền tệ).
 * @example formatAmount(125000) → "125.000"
 */
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount)
}
