/**
 * Lê números digitados no formato brasileiro ou internacional:
 * "1.234,56", "1,234.56", "1234,5", "1e3", "-0.5". Retorna null se inválido.
 */
export function parseLocaleNumber(raw) {
  let s = String(raw ?? '').trim().replace(/\s|_/g, '');
  if (!s) return null;
  if (/^[+-]?\d+(\.\d+)?e[+-]?\d+$/i.test(s)) return Number(s);
  const lastComma = s.lastIndexOf(',');
  const lastDot = s.lastIndexOf('.');
  if (lastComma > -1 && lastDot > -1) {
    // O separador que aparece por último é o decimal.
    if (lastComma > lastDot) s = s.replace(/\./g, '').replace(',', '.');
    else s = s.replace(/,/g, '');
  } else if (lastComma > -1) {
    s = s.split(',').length > 2 ? s.replace(/,/g, '') : s.replace(',', '.');
  } else if (s.split('.').length > 2) {
    s = s.replace(/\./g, '');
  }
  if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}
