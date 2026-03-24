export const CHECKOUT_TX_ID_KEY = 'checkout_tx_id';
export const CHECKOUT_STEP_KEY = 'checkout_step';

export function persistCheckoutSession(transactionId: string, step: 'summary'): void {
  localStorage.setItem(CHECKOUT_TX_ID_KEY, transactionId);
  localStorage.setItem(CHECKOUT_STEP_KEY, step);
}

export function readPersistedCheckout(): { transactionId: string; step: string } | null {
  const transactionId = localStorage.getItem(CHECKOUT_TX_ID_KEY);
  const step = localStorage.getItem(CHECKOUT_STEP_KEY);
  if (!transactionId || !step) return null;
  return { transactionId, step };
}

export function clearPersistedCheckout(): void {
  localStorage.removeItem(CHECKOUT_TX_ID_KEY);
  localStorage.removeItem(CHECKOUT_STEP_KEY);
}
