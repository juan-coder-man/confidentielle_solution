import { HttpException, HttpStatus } from '@nestjs/common';
import { CheckoutError } from '@api/domain/errors/checkout.error';
import type { Result } from '@api/application/rop/result';

export function mapCheckoutError(error: CheckoutError): HttpException {
  switch (error.code) {
    case 'PRODUCT_NOT_FOUND':
      return new HttpException(error.message, HttpStatus.NOT_FOUND);
    case 'TRANSACTION_NOT_FOUND':
      return new HttpException(error.message, HttpStatus.NOT_FOUND);
    case 'INSUFFICIENT_STOCK':
      return new HttpException(error.message, HttpStatus.CONFLICT);
    case 'INVALID_STATE':
      return new HttpException(error.message, HttpStatus.CONFLICT);
    case 'confidentielle_ERROR':
      return new HttpException(error.message, HttpStatus.BAD_GATEWAY);
    default:
      return new HttpException(error.message, HttpStatus.BAD_REQUEST);
  }
}

export function unwrapResult<T>(r: Result<T>): T {
  if (r.ok) {
    return r.value;
  }
  throw mapCheckoutError(r.error);
}
