import { GetTransactionUseCase } from '@api/application/use-cases/get-transaction.use-case';
import { StoreTransactionStatus } from '@api/domain/store-transaction-status';

describe('GetTransactionUseCase', () => {
  it('devuelve error si no existe', async () => {
    const transactions = {
      findById: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
      updateStatus: jest.fn(),
      setIdempotencyKey: jest.fn(),
    };
    const products = { findAll: jest.fn(), findById: jest.fn(), decrementStock: jest.fn() };
    const customers = { create: jest.fn(), findById: jest.fn() };
    const deliveries = { create: jest.fn(), findById: jest.fn() };
    const uc = new GetTransactionUseCase(
      transactions as never,
      products as never,
      customers as never,
      deliveries as never,
    );
    const r = await uc.execute('missing');
    expect(r.ok).toBe(false);
  });

  it('ensambla producto, cliente y entrega', async () => {
    const transactions = {
      findById: jest.fn().mockResolvedValue({
        id: 't1',
        publicNumber: 'TX',
        status: StoreTransactionStatus.PENDING,
        productId: 'p1',
        quantity: 2,
        customerId: 'c1',
        deliveryId: 'd1',
        subtotalCents: 10,
        baseFeeCents: 5,
        deliveryFeeCents: 8,
        totalCents: 23,
        confidentielleTransactionId: null,
        idempotencyKey: null,
      }),
      create: jest.fn(),
      updateStatus: jest.fn(),
      setIdempotencyKey: jest.fn(),
    };
    const products = {
      findAll: jest.fn(),
      findById: jest.fn().mockResolvedValue({
        id: 'p1',
        name: 'Prod',
        description: 'd',
        priceCents: 5,
        stock: 9,
        imageUrl: 'u',
      }),
      decrementStock: jest.fn(),
    };
    const customers = {
      create: jest.fn(),
      findById: jest.fn().mockResolvedValue({
        id: 'c1',
        fullName: 'N',
        email: 'e@e.com',
        phone: '1',
      }),
    };
    const deliveries = {
      create: jest.fn(),
      findById: jest.fn().mockResolvedValue({
        id: 'd1',
        customerId: 'c1',
        addressLine: 'a',
        city: 'c',
        notes: null,
      }),
    };
    const uc = new GetTransactionUseCase(
      transactions as never,
      products as never,
      customers as never,
      deliveries as never,
    );
    const r = await uc.execute('t1');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.product.name).toBe('Prod');
      expect(r.value.customer.email).toBe('e@e.com');
    }
  });
});
