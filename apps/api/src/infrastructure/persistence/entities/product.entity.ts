import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { StoreTransactionEntity } from '@api/infrastructure/persistence/entities/store-transaction.entity';

@Entity({ name: 'products' })
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ name: 'price_cents', type: 'int' })
  priceCents!: number;

  @Column({ type: 'int' })
  stock!: number;

  @Column({ name: 'image_url', type: 'varchar', length: 500 })
  imageUrl!: string;

  @OneToMany(() => StoreTransactionEntity, (t) => t.product)
  transactions!: StoreTransactionEntity[];
}
