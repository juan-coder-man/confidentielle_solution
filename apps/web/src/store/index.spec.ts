import { CHECKOUT_TX_ID_KEY } from '@web/store/persist';
import { store } from '@web/store/index';
import { setSummaryAfterCreate } from '@web/store/checkoutSlice';

describe('store listener', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('persiste id de transacción al crear resumen', () => {
    store.dispatch(
      setSummaryAfterCreate({
        transactionId: 'tx-123',
        publicNumber: 'TX',
        totals: {
          subtotalCents: 1,
          baseFeeCents: 1,
          deliveryFeeCents: 1,
          totalCents: 3,
        },
      }),
    );
    expect(localStorage.getItem(CHECKOUT_TX_ID_KEY)).toBe('tx-123');
  });
});
