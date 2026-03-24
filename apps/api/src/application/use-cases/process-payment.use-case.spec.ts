import { ProcessPaymentUseCase } from '@api/application/use-cases/process-payment.use-case';
import { StoreTransactionStatus } from '@api/domain/store-transaction-status';

describe('ProcessPaymentUseCase', () => {
  const baseTx = {
    id: 't1',
    publicNumber: 'TX-1',
    productId: 'p1',
    quantity: 1,
    customerId: 'c1',
    deliveryId: 'd1',
    subtotalCents: 100,
    baseFeeCents: 50,
    deliveryFeeCents: 80,
    totalCents: 230,
    confidentielleTransactionId: null as string | null,
    idempotencyKey: null as string | null,
  };

  it('cobra y aprueba con pasarela mock', async () => {
    const transactions = {
      findById: jest.fn().mockResolvedValue({ ...baseTx, status: StoreTransactionStatus.PENDING }),
      setIdempotencyKey: jest.fn().mockResolvedValue(undefined),
      updateStatus: jest.fn().mockResolvedValue(undefined),
    };
    const customers = {
      create: jest.fn(),
      findById: jest.fn().mockResolvedValue({
        id: 'c1',
        fullName: 'A',
        email: 'a@a.com',
        phone: '1',
      }),
    };
    const confidentielle = {
      charge: jest.fn().mockResolvedValue({
        confidentielleTransactionId: 'w1',
        status: 'APPROVED' as const,
      }),
    };
    const finalize = {
      applyApprovedPayment: jest.fn().mockResolvedValue(undefined),
    };
    const uc = new ProcessPaymentUseCase(transactions as never, customers as never, confidentielle as never, finalize as never);
    const r = await uc.execute({
      transactionId: 't1',
      cardToken: 'tok',
      idempotencyKey: 'idem-1',
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.status).toBe(StoreTransactionStatus.APPROVED);
    }
    expect(finalize.applyApprovedPayment).toHaveBeenCalled();
  });

  it('registra declinación sin finalizar stock', async () => {
    const transactions = {
      findById: jest.fn().mockResolvedValue({ ...baseTx, status: StoreTransactionStatus.PENDING }),
      setIdempotencyKey: jest.fn().mockResolvedValue(undefined),
      updateStatus: jest.fn().mockResolvedValue(undefined),
    };
    const customers = {
      create: jest.fn(),
      findById: jest.fn().mockResolvedValue({
        id: 'c1',
        fullName: 'A',
        email: 'a@a.com',
        phone: '1',
      }),
    };
    const confidentielle = {
      charge: jest.fn().mockResolvedValue({
        confidentielleTransactionId: 'w2',
        status: 'DECLINED' as const,
      }),
    };
    const finalize = { applyApprovedPayment: jest.fn() };
    const uc = new ProcessPaymentUseCase(transactions as never, customers as never, confidentielle as never, finalize as never);
    const r = await uc.execute({
      transactionId: 't1',
      cardToken: 'tok',
      idempotencyKey: 'idem-d',
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.status).toBe(StoreTransactionStatus.DECLINED);
    }
    expect(finalize.applyApprovedPayment).not.toHaveBeenCalled();
    expect(transactions.updateStatus).toHaveBeenCalled();
  });

  it('repite resultado si ya está aprobada y coincide idempotencia', async () => {
    const transactions = {
      findById: jest.fn().mockResolvedValue({
        ...baseTx,
        status: StoreTransactionStatus.APPROVED,
        confidentielleTransactionId: 'w1',
        idempotencyKey: 'idem-1',
      }),
      setIdempotencyKey: jest.fn(),
      updateStatus: jest.fn(),
    };
    const customers = { create: jest.fn(), findById: jest.fn() };
    const confidentielle = { charge: jest.fn() };
    const finalize = { applyApprovedPayment: jest.fn() };
    const uc = new ProcessPaymentUseCase(transactions as never, customers as never, confidentielle as never, finalize as never);
    const r = await uc.execute({
      transactionId: 't1',
      cardToken: 'tok',
      idempotencyKey: 'idem-1',
    });
    expect(r.ok).toBe(true);
    expect(confidentielle.charge).not.toHaveBeenCalled();
  });
});
