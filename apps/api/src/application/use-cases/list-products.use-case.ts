import { Inject, Injectable } from '@nestjs/common';
import type { ProductRepositoryPort } from '@api/application/ports/product.repository.port';
import { PRODUCT_REPOSITORY } from '@api/application/tokens';
import { ok, type Result } from '@api/application/rop/result';

@Injectable()
export class ListProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly products: ProductRepositoryPort,
  ) {}

  async execute(): Promise<Result<readonly { id: string; name: string; description: string; priceCents: number; stock: number; imageUrl: string }[]>> {
    const rows = await this.products.findAll();
    return ok(rows);
  }
}
