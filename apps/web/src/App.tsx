import { useEffect, useState } from 'react';
import type { CardDraft } from '@web/checkout/card-draft';
import { fetchTransaction } from '@web/api/client';
import { ProductCatalog } from '@web/components/ProductCatalog';
import { PaymentModal } from '@web/components/PaymentModal';
import { ResultPanel } from '@web/components/ResultPanel';
import { SummaryBackdrop } from '@web/components/SummaryBackdrop';
import { useAppDispatch, useAppSelector } from '@web/store/hooks';
import { loadProducts } from '@web/store/catalogSlice';
import { hydratePendingFromServer } from '@web/store/checkoutSlice';
import {
  clearPersistedCheckout,
  readPersistedCheckout,
} from '@web/store/persist';
import '@web/styles/global.css';

export function App() {
  const dispatch = useAppDispatch();
  const step = useAppSelector((s) => s.checkout.step);
  const [cardDraft, setCardDraft] = useState<CardDraft | null>(null);

  useEffect(() => {
    void dispatch(loadProducts());
  }, [dispatch]);

  useEffect(() => {
    const persisted = readPersistedCheckout();
    if (!persisted) {
      return;
    }
    void (async () => {
      try {
        const tx = await fetchTransaction(persisted.transactionId);
        if (tx.status === 'PENDING' && persisted.step === 'summary') {
          dispatch(hydratePendingFromServer(tx));
          setCardDraft(null);
        } else {
          clearPersistedCheckout();
        }
      } catch {
        clearPersistedCheckout();
      }
    })();
  }, [dispatch]);

  useEffect(() => {
    if (step === 'catalog' || step === 'result') {
      setCardDraft(null);
    }
  }, [step]);

  const showMainChrome = step !== 'result';

  return (
    <>
      {showMainChrome ? (
        <div
          className="layout"
          style={
            step === 'summary'
              ? { pointerEvents: 'none', opacity: 0.45 }
              : undefined
          }
          aria-hidden={step === 'summary'}
        >
          <header className="toolbar">
            <div>
              <h1 className="title">Tienda demo</h1>
              <p className="subtitle">Pago con tarjeta (sandbox)</p>
            </div>
          </header>
          <ProductCatalog />
        </div>
      ) : null}

      <PaymentModal onCardDraft={(d) => setCardDraft(d)} />
      <SummaryBackdrop cardDraft={cardDraft} />
      <ResultPanel />
    </>
  );
}
