export function formatCurrency(amount: number): string {
  if (amount === 0) return 'Miễn phí';
  return amount.toLocaleString('vi-VN') + ' đ';
}

/** Rút gọn tiền: 2400000 -> "2,4tr", 350000 -> "350k" */
export function formatShortMoney(amount: number): string {
  if (amount >= 1000000) {
    const m = amount / 1000000;
    const text = Number.isInteger(m) ? String(m) : m.toFixed(1).replace('.', ',');
    return `${text}tr`;
  }
  if (amount >= 1000) return `${Math.round(amount / 1000)}k`;
  return `${amount}đ`;
}
