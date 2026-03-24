export type CardBrand = 'visa' | 'mastercard' | 'unknown';

export function detectCardBrand(digits: string): CardBrand {
  const n = digits.replace(/\D/g, '');
  if (/^4/.test(n)) return 'visa';
  if (/^5[1-5]/.test(n) || /^2(2[2-9]\d|[3-6]\d{2}|7[01]\d|720)/.test(n)) {
    return 'mastercard';
  }
  return 'unknown';
}

export function luhnValid(digits: string): boolean {
  const n = digits.replace(/\D/g, '');
  if (n.length < 13 || n.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = n.length - 1; i >= 0; i -= 1) {
    let d = parseInt(n[i]!, 10);
    if (alt) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function normalizeExpiry(month: string, year: string): { mm: string; yy: string } | null {
  const m = month.replace(/\D/g, '').slice(0, 2);
  let y = year.replace(/\D/g, '');
  if (y.length === 2) {
    y = `20${y}`;
  }
  if (m.length !== 2 || y.length !== 4) return null;
  const mi = parseInt(m, 10);
  if (mi < 1 || mi > 12) return null;
  return { mm: m, yy: y };
}
