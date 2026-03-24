import { BASE_FEE_CENTS, DELIVERY_FEE_CENTS } from '@api/domain/constants/fees';

export interface CheckoutTotals {
  subtotalCents: number;
  baseFeeCents: number;
  deliveryFeeCents: number;
  totalCents: number;
}

export function computeCheckoutTotals(
  unitPriceCents: number,
  quantity: number,
): CheckoutTotals {
  const subtotalCents = unitPriceCents * quantity;
  return {
    subtotalCents,
    baseFeeCents: BASE_FEE_CENTS,
    deliveryFeeCents: DELIVERY_FEE_CENTS,
    totalCents: subtotalCents + BASE_FEE_CENTS + DELIVERY_FEE_CENTS,
  };
}
