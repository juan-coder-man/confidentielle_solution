import catalogReducer, { loadProducts } from '@web/store/catalogSlice';

describe('catalogSlice', () => {
  it('maneja carga exitosa', () => {
    const s = catalogReducer(
      undefined,
      loadProducts.fulfilled(
        [
          {
            id: '1',
            name: 'P',
            description: 'd',
            priceCents: 1,
            stock: 1,
            imageUrl: '',
          },
        ],
        '',
        undefined,
      ),
    );
    expect(s.status).toBe('succeeded');
    expect(s.items).toHaveLength(1);
  });
});
