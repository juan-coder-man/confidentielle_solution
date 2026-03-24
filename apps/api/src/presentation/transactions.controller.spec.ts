import { CreatePendingTransactionUseCase } from '@api/application/use-cases/create-pending-transaction.use-case';
import { GetTransactionUseCase } from '@api/application/use-cases/get-transaction.use-case';
import { ProcessPaymentUseCase } from '@api/application/use-cases/process-payment.use-case';
import { ok } from '@api/application/rop/result';
import { TransactionsController } from '@api/presentation/transactions.controller';
import { StoreTransactionStatus } from '@api/domain/store-transaction-status';

describe('TransactionsController', () => {
  const createPending = { execute: jest.fn() };
  const getTx = { execute: jest.fn() };
  const pay = { execute: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('crea transacción', async () => {
    createPending.execute.mockResolvedValue(
      ok({
        transactionId: 't1',
        publicNumber: 'TX',
        status: StoreTransactionStatus.PENDING,
        totals: {
          subtotalCents: 1,
          baseFeeCents: 1,
          deliveryFeeCents: 1,
          totalCents: 3,
        },
      }),
    );
    const c = new TransactionsController(
      createPending as unknown as CreatePendingTransactionUseCase,
      getTx as unknown as GetTransactionUseCase,
      pay as unknown as ProcessPaymentUseCase,
    );
    const body = {
      productId: '00000000-0000-4000-8000-000000000001',
      quantity: 1,
      customer: { fullName: 'A', email: 'a@a.com', phone: '1' },
      delivery: { addressLine: 'x', city: 'y' },
    };
    await expect(c.create(body as never)).resolves.toMatchObject({ transactionId: 't1' });
  });

  it('exige idempotency key en pago', async () => {
    const c = new TransactionsController(
      createPending as unknown as CreatePendingTransactionUseCase,
      getTx as unknown as GetTransactionUseCase,
      pay as unknown as ProcessPaymentUseCase,
    );
    await expect(
      c.pay('00000000-0000-4000-8000-000000000002', { cardToken: 'tok' }, undefined),
    ).rejects.toBeDefined();
  });
});
