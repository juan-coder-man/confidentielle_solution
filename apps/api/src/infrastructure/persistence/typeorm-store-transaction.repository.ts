import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StoreTransactionStatus } from '@api/domain/store-transaction-status';
import type {
  CreateStoreTransactionInput,
  StoreTransactionRecord,
  StoreTransactionRepositoryPort,
} from '@api/application/ports/transaction.repository.port';
import { StoreTransactionEntity } from '@api/infrastructure/persistence/entities/store-transaction.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TypeOrmStoreTransactionRepository implements StoreTransactionRepositoryPort {
  constructor(
    @InjectRepository(StoreTransactionEntity)
    private readonly repo: Repository<StoreTransactionEntity>,
  ) {}

  async create(input: CreateStoreTransactionInput): Promise<StoreTransactionRecord> {
    const row = this.repo.create({
      publicNumber: input.publicNumber,
      status: StoreTransactionStatus.PENDING,
      productId: input.productId,
      quantity: input.quantity,
      customerId: input.customerId,
      deliveryId: input.deliveryId,
      subtotalCents: input.subtotalCents,
      baseFeeCents: input.baseFeeCents,
      deliveryFeeCents: input.deliveryFeeCents,
      totalCents: input.totalCents,
      confidentielleTransactionId: null,
      idempotencyKey: null,
    });
    const saved = await this.repo.save(row);
    return this.map(saved);
  }

  async findById(id: string): Promise<StoreTransactionRecord | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? this.map(row) : null;
  }

  async updateStatus(
    id: string,
    status: StoreTransactionStatus,
    confidentielleTransactionId?: string | null,
  ): Promise<void> {
    const patch: Partial<StoreTransactionEntity> = { status };
    if (confidentielleTransactionId !== undefined) {
      patch.confidentielleTransactionId = confidentielleTransactionId;
    }
    await this.repo.update({ id }, patch);
  }

  async setIdempotencyKey(id: string, key: string): Promise<void> {
    await this.repo.update({ id }, { idempotencyKey: key });
  }

  private map(r: StoreTransactionEntity): StoreTransactionRecord {
    return {
      id: r.id,
      publicNumber: r.publicNumber,
      status: r.status,
      productId: r.productId,
      quantity: r.quantity,
      customerId: r.customerId,
      deliveryId: r.deliveryId,
      subtotalCents: r.subtotalCents,
      baseFeeCents: r.baseFeeCents,
      deliveryFeeCents: r.deliveryFeeCents,
      totalCents: r.totalCents,
      confidentielleTransactionId: r.confidentielleTransactionId,
      idempotencyKey: r.idempotencyKey,
    };
  }
}
