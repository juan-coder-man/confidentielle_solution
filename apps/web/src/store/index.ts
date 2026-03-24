import { configureStore } from '@reduxjs/toolkit';
import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import catalogReducer from '@web/store/catalogSlice';
import checkoutReducer, {
  setSummaryAfterCreate,
} from '@web/store/checkoutSlice';
import { persistCheckoutSession } from '@web/store/persist';

const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  matcher: isAnyOf(setSummaryAfterCreate),
  effect: (action) => {
    if (setSummaryAfterCreate.match(action)) {
      persistCheckoutSession(action.payload.transactionId, 'summary');
    }
  },
});

export const store = configureStore({
  reducer: {
    catalog: catalogReducer,
    checkout: checkoutReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
