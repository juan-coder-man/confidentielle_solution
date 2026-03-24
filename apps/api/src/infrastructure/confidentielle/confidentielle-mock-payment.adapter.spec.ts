import { confidentielleMockPaymentAdapter } from '@api/infrastructure/confidentielle/confidentielle-mock-payment.adapter';

describe('confidentielleMockPaymentAdapter', () => {
  it('devuelve aprobación', async () => {
    const a = new confidentielleMockPaymentAdapter();
    const r = await a.charge({
      amountInCents: 100,
      currency: 'COP',
      customerEmail: 'x@x.com',
      cardToken: 't',
      reference: 'ref',
    });
    expect(r.status).toBe('APPROVED');
    expect(r.confidentielleTransactionId).toContain('mock_');
  });
});
