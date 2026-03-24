import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { TransactionDetailDto } from '@web/api/types';

export type CheckoutStep = 'catalog' | 'payment_modal' | 'summary' | 'result';

export interface CheckoutTotals {
  subtotalCents: number;
  baseFeeCents: number;
  deliveryFeeCents: number;
  totalCents: number;
}

interface CheckoutState {
  step: CheckoutStep;
  selectedProductId: string | null;
  quantity: number;
  transactionId: string | null;
  publicNumber: string | null;
  totals: CheckoutTotals | null;
  lastPaymentStatus: 'APPROVED' | 'DECLINED' | 'ERROR' | null;
  /** Datos de UI tras hidratar (sin PAN/CVV) */
  hydratedProductName: string | null;
}

const initialState: CheckoutState = {
  step: 'catalog',
  selectedProductId: null,
  quantity: 1,
  transactionId: null,
  publicNumber: null,
  totals: null,
  lastPaymentStatus: null,
  hydratedProductName: null,
};

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    openPaymentModal(
      state,
      action: PayloadAction<{ productId: string; quantity: number }>,
    ) {
      state.selectedProductId = action.payload.productId;
      state.quantity = action.payload.quantity;
      state.step = 'payment_modal';
    },
    closePaymentModal(state) {
      state.step = 'catalog';
    },
    setSummaryAfterCreate(
      state,
      action: PayloadAction<{
        transactionId: string;
        publicNumber: string;
        totals: CheckoutTotals;
      }>,
    ) {
      state.transactionId = action.payload.transactionId;
      state.publicNumber = action.payload.publicNumber;
      state.totals = action.payload.totals;
      state.hydratedProductName = null;
      state.step = 'summary';
    },
    hydratePendingFromServer(state, action: PayloadAction<TransactionDetailDto>) {
      const tx = action.payload;
      if (tx.status !== 'PENDING') {
        return;
      }
      state.transactionId = tx.id;
      state.publicNumber = tx.publicNumber;
      state.selectedProductId = tx.product.id;
      state.quantity = tx.quantity;
      state.totals = {
        subtotalCents: tx.subtotalCents,
        baseFeeCents: tx.baseFeeCents,
        deliveryFeeCents: tx.deliveryFeeCents,
        totalCents: tx.totalCents,
      };
      state.hydratedProductName = tx.product.name;
      state.step = 'summary';
    },
    setPaymentResult(
      state,
      action: PayloadAction<{ status: 'APPROVED' | 'DECLINED' | 'ERROR' }>,
    ) {
      state.lastPaymentStatus = action.payload.status;
      state.step = 'result';
    },
    resetCheckoutToCatalog() {
      return { ...initialState, step: 'catalog' as const };
    },
  },
});

export const {
  openPaymentModal,
  closePaymentModal,
  setSummaryAfterCreate,
  hydratePendingFromServer,
  setPaymentResult,
  resetCheckoutToCatalog,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
