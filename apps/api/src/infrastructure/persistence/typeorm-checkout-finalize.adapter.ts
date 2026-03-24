import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import type { CheckoutFinalizePort } from '@api/application/ports/checkout-finalize.port';
import { StoreTransactionStatus } from '@api/domain/store-transaction-status';
import { ProductEntity } from '@api/infrastructure/persistence/entities/product.entity';
import { StoreTransactionEntity } from '@api/infrastructure/persistence/entities/store-transaction.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class TypeOrmCheckoutFinalizeAdapter implements CheckoutFinalizePort {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async applyApprovedPayment(params: {
    transactionId: string;
    productId: string;
    quantity: number;
    confidentielleTransactionId: string;
  }): Promise<void> {
    await this.dataSource.transaction(async (em) => {
      const product = await em.findOne(ProductEntity, {
        where: { id: params.productId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!product || product.stock < params.quantity) {
        throw new Error('INSUFFICIENT_STOCK');
      }
      product.stock -= params.quantity;
      await em.save(product);

      await em.update(
        StoreTransactionEntity,
        { id: params.transactionId },
        {
          status: StoreTransactionStatus.APPROVED,
          confidentielleTransactionId: params.confidentielleTransactionId,
        },
      );
    });
  }
}
