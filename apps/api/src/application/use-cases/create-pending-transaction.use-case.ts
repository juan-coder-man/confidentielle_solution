import { Inject, Injectable } from '@nestjs/common';
import { computeCheckoutTotals } from '@api/domain/checkout-totals';
import { CheckoutError } from '@api/domain/errors/checkout.error';
import { StoreTransactionStatus } from '@api/domain/store-transaction-status';
import type { CreateCustomerInput } from '@api/application/ports/customer.repository.port';
import type { CreateDeliveryInput } from '@api/application/ports/delivery.repository.port';
import type { CustomerRepositoryPort } from '@api/application/ports/customer.repository.port';
import type { DeliveryRepositoryPort } from '@api/application/ports/delivery.repository.port';
import type { ProductRepositoryPort } from '@api/application/ports/product.repository.port';
import type { StoreTransactionRepositoryPort } from '@api/application/ports/transaction.repository.port';
import { err, ok, type Result } from '@api/application/rop/result';
import {
  CUSTOMER_REPOSITORY,
  DELIVERY_REPOSITORY,
  PRODUCT_REPOSITORY,
  STORE_TRANSACTION_REPOSITORY,
} from '@api/application/tokens';

function buildPublicNumber(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TX-${y}${m}${day}-${rnd}`;
}

export interface CreatePendingTransactionInput {
  productId: string;
  quantity: number;
  customer: CreateCustomerInput;
  delivery: Omit<CreateDeliveryInput, 'customerId'>;
}

export interface CreatePendingTransactionOutput {
  transactionId: string;
  publicNumber: string;
  status: StoreTransactionStatus;
  totals: ReturnType<typeof computeCheckoutTotals>;
}

@Injectable()
export class CreatePendingTransactionUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly products: ProductRepositoryPort,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customers: CustomerRepositoryPort,
    @Inject(DELIVERY_REPOSITORY)
    private readonly deliveries: DeliveryRepositoryPort,
    @Inject(STORE_TRANSACTION_REPOSITORY)
    private readonly transactions: StoreTransactionRepositoryPort,
  ) {}

  async execute(
    input: CreatePendingTransactionInput,
  ): Promise<Result<CreatePendingTransactionOutput>> {
    const product = await this.products.findById(input.productId);
    if (!product) {
      return err(new CheckoutError('PRODUCT_NOT_FOUND'));
    }
    if (product.stock < input.quantity) {
      return err(new CheckoutError('INSUFFICIENT_STOCK'));
    }

    const totals = computeCheckoutTotals(product.priceCents, input.quantity);
    const customer = await this.customers.create(input.customer);
    const delivery = await this.deliveries.create({
      customerId: customer.id,
      addressLine: input.delivery.addressLine,
      city: input.delivery.city,
      notes: input.delivery.notes,
    });

    const tx = await this.transactions.create({
      publicNumber: buildPublicNumber(),
      productId: product.id,
      quantity: input.quantity,
      customerId: customer.id,
      deliveryId: delivery.id,
      subtotalCents: totals.subtotalCents,
      baseFeeCents: totals.baseFeeCents,
      deliveryFeeCents: totals.deliveryFeeCents,
      totalCents: totals.totalCents,
    });

    return ok({
      transactionId: tx.id,
      publicNumber: tx.publicNumber,
      status: StoreTransactionStatus.PENDING,
      totals,
    });
  }
}
