import { StoreTransactionStatus } from '@api/domain/store-transaction-status';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CustomerEntity } from '@api/infrastructure/persistence/entities/customer.entity';
import { DeliveryEntity } from '@api/infrastructure/persistence/entities/delivery.entity';
import { ProductEntity } from '@api/infrastructure/persistence/entities/product.entity';

@Entity({ name: 'store_transactions' })
export class StoreTransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'public_number', type: 'varchar', length: 40, unique: true })
  publicNumber!: string;

  @Column({
    type: 'enum',
    enum: StoreTransactionStatus,
    default: StoreTransactionStatus.PENDING,
  })
  status!: StoreTransactionStatus;

  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @ManyToOne(() => ProductEntity, (p) => p.transactions, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_id' })
  product!: ProductEntity;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId!: string;

  @ManyToOne(() => CustomerEntity, (c) => c.transactions, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'customer_id' })
  customer!: CustomerEntity;

  @Column({ name: 'delivery_id', type: 'uuid' })
  deliveryId!: string;

  @ManyToOne(() => DeliveryEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'delivery_id' })
  delivery!: DeliveryEntity;

  @Column({ name: 'subtotal_cents', type: 'int' })
  subtotalCents!: number;

  @Column({ name: 'base_fee_cents', type: 'int' })
  baseFeeCents!: number;

  @Column({ name: 'delivery_fee_cents', type: 'int' })
  deliveryFeeCents!: number;

  @Column({ name: 'total_cents', type: 'int' })
  totalCents!: number;

  @Column({ name: 'confidentielle_transaction_id', type: 'varchar', length: 120, nullable: true })
  confidentielleTransactionId!: string | null;

  @Column({ name: 'idempotency_key', type: 'varchar', length: 120, nullable: true })
  idempotencyKey!: string | null;
}
