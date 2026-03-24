import {
  CHECKOUT_STEP_KEY,
  CHECKOUT_TX_ID_KEY,
  clearPersistedCheckout,
  persistCheckoutSession,
  readPersistedCheckout,
} from '@web/store/persist';

describe('persist checkout session', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('persiste y lee', () => {
    persistCheckoutSession('tid', 'summary');
    expect(readPersistedCheckout()).toEqual({ transactionId: 'tid', step: 'summary' });
  });

  it('limpia', () => {
    localStorage.setItem(CHECKOUT_TX_ID_KEY, 'x');
    localStorage.setItem(CHECKOUT_STEP_KEY, 'summary');
    clearPersistedCheckout();
    expect(readPersistedCheckout()).toBeNull();
  });
});
