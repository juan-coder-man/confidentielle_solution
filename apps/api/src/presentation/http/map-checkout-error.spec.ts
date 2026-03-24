import { HttpStatus } from '@nestjs/common';
import { CheckoutError } from '@api/domain/errors/checkout.error';
import { err, ok } from '@api/application/rop/result';
import {
  mapCheckoutError,
  unwrapResult,
} from '@api/presentation/http/map-checkout-error';

describe('mapCheckoutError', () => {
  it('mapea PRODUCT_NOT_FOUND a 404', () => {
    const e = mapCheckoutError(new CheckoutError('PRODUCT_NOT_FOUND'));
    expect(e.getStatus()).toBe(HttpStatus.NOT_FOUND);
  });

  it('mapea INSUFFICIENT_STOCK a 409', () => {
    const e = mapCheckoutError(new CheckoutError('INSUFFICIENT_STOCK'));
    expect(e.getStatus()).toBe(HttpStatus.CONFLICT);
  });
});

describe('unwrapResult', () => {
  it('devuelve valor en ok', () => {
    expect(unwrapResult(ok(3))).toBe(3);
  });

  it('lanza HttpException en error', () => {
    expect(() => unwrapResult(err(new CheckoutError('PRODUCT_NOT_FOUND')))).toThrow();
  });
});
