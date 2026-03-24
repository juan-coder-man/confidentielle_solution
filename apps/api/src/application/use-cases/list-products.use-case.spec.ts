import { ListProductsUseCase } from '@api/application/use-cases/list-products.use-case';
import type { ProductRepositoryPort } from '@api/application/ports/product.repository.port';

describe('ListProductsUseCase', () => {
  it('devuelve productos del repositorio', async () => {
    const repo: ProductRepositoryPort = {
      findAll: async () => [
        {
          id: '1',
          name: 'P',
          description: 'd',
          priceCents: 100,
          stock: 1,
          imageUrl: 'u',
        },
      ],
      findById: async () => null,
      decrementStock: async () => {},
    };
    const uc = new ListProductsUseCase(repo);
    const r = await uc.execute();
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value).toHaveLength(1);
      expect(r.value[0]!.name).toBe('P');
    }
  });
});
