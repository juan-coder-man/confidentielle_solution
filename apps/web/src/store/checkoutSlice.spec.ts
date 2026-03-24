import checkoutReducer, {
  hydratePendingFromServer,
  openPaymentModal,
  resetCheckoutToCatalog,
  setSummaryAfterCreate,
} from '@web/store/checkoutSlice';

describe('checkoutSlice', () => {
  it('abre modal de pago', () => {
    const s = checkoutReducer(undefined, openPaymentModal({ productId: 'p', quantity: 2 }));
    expect(s.step).toBe('payment_modal');
    expect(s.quantity).toBe(2);
  });

  it('resume resumen desde servidor', () => {
    const s = checkoutReducer(
      undefined,
      hydratePendingFromServer({
        id: 't1',
        publicNumber: 'TX',
        status: 'PENDING',
        quantity: 1,
        subtotalCents: 1,
        baseFeeCents: 2,
        deliveryFeeCents: 3,
        totalCents: 6,
        confidentielleTransactionId: null,
        product: {
          id: 'p1',
          name: 'X',
          description: 'd',
          priceCents: 1,
          imageUrl: '',
        },
        customer: { fullName: 'a', email: 'a@a.com', phone: '1' },
        delivery: { addressLine: 'a', city: 'c', notes: null },
      }),
    );
    expect(s.step).toBe('summary');
    expect(s.transactionId).toBe('t1');
  });

  it('resetea a catálogo', () => {
    const s1 = checkoutReducer(
      undefined,
      setSummaryAfterCreate({
        transactionId: 't',
        publicNumber: 'TX',
        totals: {
          subtotalCents: 1,
          baseFeeCents: 1,
          deliveryFeeCents: 1,
          totalCents: 3,
        },
      }),
    );
    const s2 = checkoutReducer(s1, resetCheckoutToCatalog());
    expect(s2.step).toBe('catalog');
    expect(s2.transactionId).toBeNull();
  });
});
