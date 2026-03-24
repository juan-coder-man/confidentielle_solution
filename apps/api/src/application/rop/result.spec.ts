import { err, ok } from '@api/application/rop/result';
import { CheckoutError } from '@api/domain/errors/checkout.error';

describe('result', () => {
  it('ok envuelve valor', () => {
    const r = ok(10);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(10);
  });

  it('err envuelve CheckoutError', () => {
    const r = err(new CheckoutError('INVALID_STATE'));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe('INVALID_STATE');
  });
});
