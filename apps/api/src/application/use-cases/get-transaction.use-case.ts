import { Inject, Injectable } from '@nestjs/common';
import { CheckoutError } from '@api/domain/errors/checkout.error';
import { StoreTransactionStatus } from '@api/domain/store-transaction-status';
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

export interface TransactionDetails {
  id: string;
  publicNumber: string;
  status: StoreTransactionStatus;
  quantity: number;
  subtotalCents: number;
  baseFeeCents: number;
  deliveryFeeCents: number;
  totalCents: number;
  confidentielleTransactionId: string | null;
  product: {
    id: string;
    name: string;
    description: string;
    priceCents: number;
    imageUrl: string;
  };
  customer: {
    fullName: string;
    email: string;
    phone: string;
  };
  delivery: {
    addressLine: string;
    city: string;
    notes: string | null;
  };
}

@Injectable()
export class GetTransactionUseCase {
  constructor(
    @Inject(STORE_TRANSACTION_REPOSITORY)
    private readonly transactions: StoreTransactionRepositoryPort,
    @Inject(PRODUCT_REPOSITORY)
    private readonly products: ProductRepositoryPort,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customers: CustomerRepositoryPort,
    @Inject(DELIVERY_REPOSITORY)
    private readonly deliveries: DeliveryRepositoryPort,
  ) {}

  async execute(id: string): Promise<Result<TransactionDetails>> {
    const tx = await this.transactions.findById(id);
    if (!tx) {
      return err(new CheckoutError('TRANSACTION_NOT_FOUND'));
    }
    const product = await this.products.findById(tx.productId);
    if (!product) {
      return err(new CheckoutError('PRODUCT_NOT_FOUND'));
    }
    const customer = await this.customers.findById(tx.customerId);
    const delivery = await this.deliveries.findById(tx.deliveryId);

    if (!customer || !delivery) {
      return err(new CheckoutError('TRANSACTION_NOT_FOUND'));
    }

    return ok({
      id: tx.id,
      publicNumber: tx.publicNumber,
      status: tx.status,
      quantity: tx.quantity,
      subtotalCents: tx.subtotalCents,
      baseFeeCents: tx.baseFeeCents,
      deliveryFeeCents: tx.deliveryFeeCents,
      totalCents: tx.totalCents,
      confidentielleTransactionId: tx.confidentielleTransactionId,
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        priceCents: product.priceCents,
        imageUrl: product.imageUrl,
      },
      customer: {
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
      },
      delivery: {
        addressLine: delivery.addressLine,
        city: delivery.city,
        notes: delivery.notes,
      },
    });
  }
}
