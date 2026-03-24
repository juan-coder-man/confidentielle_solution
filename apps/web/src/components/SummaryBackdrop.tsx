import { useState } from 'react';
import { payTransaction } from '@web/api/client';
import { createconfidentielleCardToken } from '@web/api/confidentielle-token';
import type { CardDraft } from '@web/checkout/card-draft';
import { useAppDispatch, useAppSelector } from '@web/store/hooks';
import { loadProducts } from '@web/store/catalogSlice';
import {
  resetCheckoutToCatalog,
  setPaymentResult,
} from '@web/store/checkoutSlice';
import { clearPersistedCheckout } from '@web/store/persist';
import { formatCopFromCents } from '@web/utils/money';

export function SummaryBackdrop({ cardDraft }: { cardDraft: CardDraft | null }) {
  const dispatch = useAppDispatch();
  const step = useAppSelector((s) => s.checkout.step);
  const totals = useAppSelector((s) => s.checkout.totals);
  const publicNumber = useAppSelector((s) => s.checkout.publicNumber);
  const transactionId = useAppSelector((s) => s.checkout.transactionId);
  const product = useAppSelector((s) =>
    s.catalog.items.find((p) => p.id === s.checkout.selectedProductId),
  );
  const hydratedName = useAppSelector((s) => s.checkout.hydratedProductName);
  const quantity = useAppSelector((s) => s.checkout.quantity);

  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  if (step !== 'summary' || !totals || !transactionId) {
    return null;
  }

  const productLabel = product?.name ?? hydratedName ?? 'Producto';

  const onPay = async () => {
    setPayError(null);
    if (!cardDraft) {
      setPayError('No hay datos de tarjeta en memoria. Abre de nuevo el formulario de pago.');
      return;
    }
    setPaying(true);
    try {
      const token = await createconfidentielleCardToken(cardDraft);
      const idem =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;
      const res = await payTransaction(transactionId, token, idem);
      const st = res.status;
      dispatch(
        setPaymentResult({
          status:
            st === 'APPROVED' ? 'APPROVED' : st === 'DECLINED' ? 'DECLINED' : 'ERROR',
        }),
      );
    } catch (e) {
      setPayError(e instanceof Error ? e.message : 'Error al procesar el pago');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="backdrop-root" role="dialog" aria-modal="true" aria-labelledby="sum-title">
      <div className="backdrop-rear" aria-hidden />
      <div className="backdrop-front">
        <h2 id="sum-title">Resumen del pago</h2>
        <div className="banner">
          Referencia: <strong>{publicNumber}</strong>
        </div>
        <div className="line">
          <span className="muted">Producto</span>
          <span>
            {productLabel} × {quantity}
          </span>
        </div>
        <div className="line">
          <span className="muted">Subtotal</span>
          <span>{formatCopFromCents(totals.subtotalCents)}</span>
        </div>
        <div className="line">
          <span className="muted">Tarifa base</span>
          <span>{formatCopFromCents(totals.baseFeeCents)}</span>
        </div>
        <div className="line">
          <span className="muted">Envío</span>
          <span>{formatCopFromCents(totals.deliveryFeeCents)}</span>
        </div>
        <div className="line">
          <span>Total</span>
          <span>{formatCopFromCents(totals.totalCents)}</span>
        </div>

        {!cardDraft ? (
          <p className="banner error" style={{ marginTop: 12 }}>
            Tras recargar la página, vuelve a abrir &quot;Pagar con tarjeta&quot; para ingresar la
            tarjeta antes de cobrar.
          </p>
        ) : null}
        {payError ? <div className="banner error">{payError}</div> : null}

        {!cardDraft ? (
          <button
            type="button"
            className="secondary"
            style={{ width: '100%', marginTop: 10 }}
            onClick={() => {
              clearPersistedCheckout();
              dispatch(resetCheckoutToCatalog());
              void dispatch(loadProducts());
            }}
          >
            Volver al catálogo
          </button>
        ) : null}

        <button
          type="button"
          className="primary"
          style={{ width: '100%', marginTop: 12 }}
          disabled={paying || !cardDraft}
          onClick={() => void onPay()}
        >
          {paying ? 'Procesando…' : 'Pagar ahora'}
        </button>
      </div>
    </div>
  );
}
