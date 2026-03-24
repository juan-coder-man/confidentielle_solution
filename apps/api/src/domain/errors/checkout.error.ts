export type CheckoutErrorCode =
  | 'PRODUCT_NOT_FOUND'
  | 'INSUFFICIENT_STOCK'
  | 'TRANSACTION_NOT_FOUND'
  | 'INVALID_STATE'
  | 'confidentielle_ERROR';

export class CheckoutError extends Error {
  constructor(
    readonly code: CheckoutErrorCode,
    message?: string,
  ) {
    super(message ?? code);
    this.name = 'CheckoutError';
  }
}
