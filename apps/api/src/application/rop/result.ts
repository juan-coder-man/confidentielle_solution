import type { CheckoutError } from '@api/domain/errors/checkout.error';

export type Ok<T> = { ok: true; value: T };
export type Err = { ok: false; error: CheckoutError };

export type Result<T> = Ok<T> | Err;

export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

export function err(error: CheckoutError): Err {
  return { ok: false, error };
}
