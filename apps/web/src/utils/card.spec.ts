import { detectCardBrand, luhnValid, normalizeExpiry } from '@web/utils/card';

describe('card utils', () => {
  it('detecta visa', () => {
    expect(detectCardBrand('4242424242424242')).toBe('visa');
  });

  it('valida luhn conocido', () => {
    expect(luhnValid('4242424242424242')).toBe(true);
  });

  it('normaliza expiración', () => {
    expect(normalizeExpiry('12', '30')).toEqual({ mm: '12', yy: '2030' });
  });
});
