import { CreatePendingTransactionUseCase } from '@api/application/use-cases/create-pending-transaction.use-case';
import { StoreTransactionStatus } from '@api/domain/store-transaction-status';
import type { CustomerRepositoryPort } from '@api/application/ports/customer.repository.port';
import type { DeliveryRepositoryPort } from '@api/application/ports/delivery.repository.port';
import type { ProductRepositoryPort } from '@api/application/ports/product.repository.port';
import type { StoreTransactionRepositoryPort } from '@api/application/ports/transaction.repository.port';

describe('CreatePendingTransactionUseCase', () => {
  it('rechaza stock insuficiente', async () => {
    const products: ProductRepositoryPort = {
      findAll: async () => [],
      findById: async () => ({
        id: 'p1',
        name: 'x',
        description: 'd',
        priceCents: 1000,
        stock: 1,
        imageUrl: '',
      }),
      decrementStock: async () => {},
    };
    const customers: CustomerRepositoryPort = {
      create: async (i) => ({ id: 'c1', ...i }),
      findById: async () => null,
    };
    const deliveries: DeliveryRepositoryPort = {
      create: async (i) => ({
        id: 'd1',
        customerId: i.customerId,
        addressLine: i.addressLine,
        city: i.city,
        notes: i.notes ?? null,
      }),
      findById: async () => null,
    };
    const txs: StoreTransactionRepositoryPort = {
      create: async () => ({
        id: 't1',
        publicNumber: 'TX',
        status: StoreTransactionStatus.PENDING,
        productId: 'p1',
        quantity: 2,
        customerId: 'c1',
        deliveryId: 'd1',
        subtotalCents: 0,
        baseFeeCents: 0,
        deliveryFeeCents: 0,
        totalCents: 0,
        confidentielleTransactionId: null,
        idempotencyKey: null,
      }),
      findById: async () => null,
      updateStatus: async () => {},
      setIdempotencyKey: async () => {},
    };
    const uc = new CreatePendingTransactionUseCase(products, customers, deliveries, txs);
    const r = await uc.execute({
      productId: 'p1',
      quantity: 5,
      customer: { fullName: 'a', email: 'a@a.com', phone: '1' },
      delivery: { addressLine: 'x', city: 'y' },
    });
    expect(r.ok).toBe(false);
  });

  it('crea transacción pendiente', async () => {
    const products: ProductRepositoryPort = {
      findAll: async () => [],
      findById: async () => ({
        id: 'p1',
        name: 'x',
        description: 'd',
        priceCents: 1_000_000,
        stock: 10,
        imageUrl: '',
      }),
      decrementStock: async () => {},
    };
    const customers: CustomerRepositoryPort = {
      create: async (i) => ({ id: 'c1', ...i }),
      findById: async () => null,
    };
    const deliveries: DeliveryRepositoryPort = {
      create: async (i) => ({
        id: 'd1',
        customerId: i.customerId,
        addressLine: i.addressLine,
        city: i.city,
        notes: i.notes ?? null,
      }),
      findById: async () => null,
    };
    const txs: StoreTransactionRepositoryPort = {
      create: async (i) => ({
        id: 't1',
        publicNumber: i.publicNumber,
        status: StoreTransactionStatus.PENDING,
        productId: i.productId,
        quantity: i.quantity,
        customerId: i.customerId,
        deliveryId: i.deliveryId,
        subtotalCents: i.subtotalCents,
        baseFeeCents: i.baseFeeCents,
        deliveryFeeCents: i.deliveryFeeCents,
        totalCents: i.totalCents,
        confidentielleTransactionId: null,
        idempotencyKey: null,
      }),
      findById: async () => null,
      updateStatus: async () => {},
      setIdempotencyKey: async () => {},
    };
    const uc = new CreatePendingTransactionUseCase(products, customers, deliveries, txs);
    const r = await uc.execute({
      productId: 'p1',
      quantity: 2,
      customer: { fullName: 'a', email: 'a@a.com', phone: '1' },
      delivery: { addressLine: 'x', city: 'y' },
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.transactionId).toBe('t1');
      expect(r.value.totals.subtotalCents).toBe(2_000_000);
    }
  });
});
