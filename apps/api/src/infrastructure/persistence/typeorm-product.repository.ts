import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type {
  ProductRecord,
  ProductRepositoryPort,
} from '@api/application/ports/product.repository.port';
import { ProductEntity } from '@api/infrastructure/persistence/entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TypeOrmProductRepository implements ProductRepositoryPort {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repo: Repository<ProductEntity>,
  ) {}

  async findAll(): Promise<ProductRecord[]> {
    const rows = await this.repo.find({ order: { name: 'ASC' } });
    return rows.map((r) => this.map(r));
  }

  async findById(id: string): Promise<ProductRecord | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? this.map(row) : null;
  }

  async decrementStock(productId: string, quantity: number): Promise<void> {
    await this.repo.manager.transaction(async (em) => {
      const product = await em.findOne(ProductEntity, {
        where: { id: productId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!product || product.stock < quantity) {
        throw new Error('INSUFFICIENT_STOCK');
      }
      product.stock -= quantity;
      await em.save(product);
    });
  }

  private map(r: ProductEntity): ProductRecord {
    return {
      id: r.id,
      name: r.name,
      description: r.description,
      priceCents: r.priceCents,
      stock: r.stock,
      imageUrl: r.imageUrl,
    };
  }
}
