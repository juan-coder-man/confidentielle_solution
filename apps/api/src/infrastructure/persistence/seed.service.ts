import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from '@api/infrastructure/persistence/entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(ProductEntity)
    private readonly products: Repository<ProductEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    const count = await this.products.count();
    if (count > 0) {
      return;
    }
    const items = [
      {
        name: 'Auriculares ANC',
        description: 'Cancelación activa de ruido, 30h de batería.',
        priceCents: 15_000_000,
        stock: 25,
        imageUrl: 'https://picsum.photos/id/119/600/400',
      },
      {
        name: 'Teclado mecánico',
        description: 'Switches táctiles, layout compacto 75%.',
        priceCents: 8_900_000,
        stock: 12,
        imageUrl: 'https://picsum.photos/id/180/600/400',
      },
      {
        name: 'Lámpara de escritorio',
        description: 'LED regulable, temperatura de color ajustable.',
        priceCents: 2_450_000,
        stock: 40,
        imageUrl: 'https://picsum.photos/id/366/600/400',
      },
    ];
    for (const p of items) {
      await this.products.save(this.products.create(p));
    }
    this.logger.log('Productos semilla insertados');
  }
}
