import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DeliveryEntity } from '@api/infrastructure/persistence/entities/delivery.entity';
import { StoreTransactionEntity } from '@api/infrastructure/persistence/entities/store-transaction.entity';

@Entity({ name: 'customers' })
export class CustomerEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'full_name', type: 'varchar', length: 200 })
  fullName!: string;

  @Column({ type: 'varchar', length: 200 })
  email!: string;

  @Column({ type: 'varchar', length: 40 })
  phone!: string;

  @OneToMany(() => DeliveryEntity, (d) => d.customer)
  deliveries!: DeliveryEntity[];

  @OneToMany(() => StoreTransactionEntity, (t) => t.customer)
  transactions!: StoreTransactionEntity[];
}
