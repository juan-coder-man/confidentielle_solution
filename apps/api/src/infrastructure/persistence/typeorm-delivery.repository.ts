import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type {
  CreateDeliveryInput,
  DeliveryRecord,
  DeliveryRepositoryPort,
} from '@api/application/ports/delivery.repository.port';
import { DeliveryEntity } from '@api/infrastructure/persistence/entities/delivery.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TypeOrmDeliveryRepository implements DeliveryRepositoryPort {
  constructor(
    @InjectRepository(DeliveryEntity)
    private readonly repo: Repository<DeliveryEntity>,
  ) {}

  async create(input: CreateDeliveryInput): Promise<DeliveryRecord> {
    const row = this.repo.create({
      customerId: input.customerId,
      addressLine: input.addressLine,
      city: input.city,
      notes: input.notes ?? null,
    });
    const saved = await this.repo.save(row);
    return this.map(saved);
  }

  async findById(id: string): Promise<DeliveryRecord | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? this.map(row) : null;
  }

  private map(r: DeliveryEntity): DeliveryRecord {
    return {
      id: r.id,
      customerId: r.customerId,
      addressLine: r.addressLine,
      city: r.city,
      notes: r.notes,
    };
  }
}
