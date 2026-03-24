import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type {
  CreateCustomerInput,
  CustomerRecord,
  CustomerRepositoryPort,
} from '@api/application/ports/customer.repository.port';
import { CustomerEntity } from '@api/infrastructure/persistence/entities/customer.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TypeOrmCustomerRepository implements CustomerRepositoryPort {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly repo: Repository<CustomerEntity>,
  ) {}

  async create(input: CreateCustomerInput): Promise<CustomerRecord> {
    const row = this.repo.create({
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
    });
    const saved = await this.repo.save(row);
    return this.map(saved);
  }

  async findById(id: string): Promise<CustomerRecord | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? this.map(row) : null;
  }

  private map(r: CustomerEntity): CustomerRecord {
    return {
      id: r.id,
      fullName: r.fullName,
      email: r.email,
      phone: r.phone,
    };
  }
}
