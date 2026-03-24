import { computeCheckoutTotals } from '@api/domain/checkout-totals';
import { BASE_FEE_CENTS, DELIVERY_FEE_CENTS } from '@api/domain/constants/fees';

describe('computeCheckoutTotals', () => {
  it('suma subtotal y tarifas fijas', () => {
    const t = computeCheckoutTotals(1_000_000, 2);
    expect(t.subtotalCents).toBe(2_000_000);
    expect(t.baseFeeCents).toBe(BASE_FEE_CENTS);
    expect(t.deliveryFeeCents).toBe(DELIVERY_FEE_CENTS);
    expect(t.totalCents).toBe(2_000_000 + BASE_FEE_CENTS + DELIVERY_FEE_CENTS);
  });
});
