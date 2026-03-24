import { Inject, Injectable } from '@nestjs/common';
import { CheckoutError } from '@api/domain/errors/checkout.error';
import { StoreTransactionStatus } from '@api/domain/store-transaction-status';
import type { CheckoutFinalizePort } from '@api/application/ports/checkout-finalize.port';
import type { CustomerRepositoryPort } from '@api/application/ports/customer.repository.port';
import type { StoreTransactionRepositoryPort } from '@api/application/ports/transaction.repository.port';
import type { confidentiellePaymentPort } from '@api/application/ports/confidentielle-payment.port';
import { err, ok, type Result } from '@api/application/rop/result';
import {
  CHECKOUT_FINALIZE_PORT,
  CUSTOMER_REPOSITORY,
  STORE_TRANSACTION_REPOSITORY,
  confidentielle_PAYMENT_PORT,
} from '@api/application/tokens';

export interface ProcessPaymentOutput {
  status: StoreTransactionStatus;
  confidentielleTransactionId: string | null;
  publicNumber: string;
}

@Injectable()
export class ProcessPaymentUseCase {
  constructor(
    @Inject(STORE_TRANSACTION_REPOSITORY)
    private readonly transactions: StoreTransactionRepositoryPort,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customers: CustomerRepositoryPort,
    @Inject(confidentielle_PAYMENT_PORT)
    private readonly confidentielle: confidentiellePaymentPort,
    @Inject(CHECKOUT_FINALIZE_PORT)
    private readonly finalize: CheckoutFinalizePort,
  ) {}

  async execute(params: {
    transactionId: string;
    cardToken: string;
    idempotencyKey: string;
  }): Promise<Result<ProcessPaymentOutput>> {
    const tx = await this.transactions.findById(params.transactionId);
    if (!tx) {
      return err(new CheckoutError('TRANSACTION_NOT_FOUND'));
    }

    const customer = await this.customers.findById(tx.customerId);
    if (!customer) {
      return err(new CheckoutError('TRANSACTION_NOT_FOUND'));
    }

    const isFinalSuccessOrReject =
      tx.status === StoreTransactionStatus.APPROVED ||
      tx.status === StoreTransactionStatus.DECLINED;

    if (isFinalSuccessOrReject) {
      if (tx.idempotencyKey === params.idempotencyKey) {
        return ok({
          status: tx.status,
          confidentielleTransactionId: tx.confidentielleTransactionId,
          publicNumber: tx.publicNumber,
        });
      }
      return err(new CheckoutError('INVALID_STATE', 'La transacción ya fue procesada'));
    }

    const canCharge =
      tx.status === StoreTransactionStatus.PENDING ||
      (tx.status === StoreTransactionStatus.ERROR &&
        tx.idempotencyKey === params.idempotencyKey);

    if (!canCharge) {
      return err(new CheckoutError('INVALID_STATE', 'Estado de transacción no válido para cobro'));
    }

    if (tx.idempotencyKey === null) {
      await this.transactions.setIdempotencyKey(tx.id, params.idempotencyKey);
    } else if (tx.idempotencyKey !== params.idempotencyKey) {
      return err(new CheckoutError('INVALID_STATE', 'Clave de idempotencia inválida'));
    }

    if (tx.status === StoreTransactionStatus.ERROR) {
      await this.transactions.updateStatus(tx.id, StoreTransactionStatus.PENDING, null);
    }

    let charge;
    try {
      charge = await this.confidentielle.charge({
        amountInCents: tx.totalCents,
        currency: 'COP',
        customerEmail: customer.email,
        cardToken: params.cardToken,
        reference: tx.publicNumber,
      });
    } catch {
      await this.transactions.updateStatus(
        tx.id,
        StoreTransactionStatus.ERROR,
        null,
      );
      return err(new CheckoutError('confidentielle_ERROR', 'Error al contactar el proveedor de pagos'));
    }

    if (charge.status === 'APPROVED') {
      await this.finalize.applyApprovedPayment({
        transactionId: tx.id,
        productId: tx.productId,
        quantity: tx.quantity,
        confidentielleTransactionId: charge.confidentielleTransactionId,
      });
      return ok({
        status: StoreTransactionStatus.APPROVED,
        confidentielleTransactionId: charge.confidentielleTransactionId,
        publicNumber: tx.publicNumber,
      });
    }

    const declined =
      charge.status === 'DECLINED' ? StoreTransactionStatus.DECLINED : StoreTransactionStatus.ERROR;
    await this.transactions.updateStatus(tx.id, declined, charge.confidentielleTransactionId ?? null);

    return ok({
      status: declined,
      confidentielleTransactionId: charge.confidentielleTransactionId ?? null,
      publicNumber: tx.publicNumber,
    });
  }
}
