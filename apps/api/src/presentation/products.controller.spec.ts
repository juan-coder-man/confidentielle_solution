import { ListProductsUseCase } from '@api/application/use-cases/list-products.use-case';
import { ok } from '@api/application/rop/result';
import { ProductsController } from '@api/presentation/products.controller';

describe('ProductsController', () => {
  it('lista productos', async () => {
    const uc = { execute: jest.fn().mockResolvedValue(ok([])) };
    const c = new ProductsController(uc as unknown as ListProductsUseCase);
    await expect(c.list()).resolves.toEqual([]);
  });
});
