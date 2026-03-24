import { useAppDispatch, useAppSelector } from '@web/store/hooks';
import { loadProducts } from '@web/store/catalogSlice';
import { resetCheckoutToCatalog } from '@web/store/checkoutSlice';
import { clearPersistedCheckout } from '@web/store/persist';

export function ResultPanel() {
  const dispatch = useAppDispatch();
  const step = useAppSelector((s) => s.checkout.step);
  const status = useAppSelector((s) => s.checkout.lastPaymentStatus);
  const publicNumber = useAppSelector((s) => s.checkout.publicNumber);

  if (step !== 'result' || !status) {
    return null;
  }

  const ok = status === 'APPROVED';

  const onContinue = () => {
    clearPersistedCheckout();
    dispatch(resetCheckoutToCatalog());
    void dispatch(loadProducts());
  };

  return (
    <div className="layout">
      <div className={ok ? 'banner' : 'banner error'}>
        <strong>{ok ? 'Pago aprobado' : 'Pago no completado'}</strong>
        <div style={{ marginTop: 8 }}>
          Referencia: <strong>{publicNumber}</strong>
        </div>
        {!ok ? (
          <p style={{ margin: '8px 0 0' }}>
            Estado: <strong>{status}</strong>
          </p>
        ) : null}
      </div>
      <button type="button" className="primary" style={{ width: '100%' }} onClick={onContinue}>
        Volver al catálogo
      </button>
    </div>
  );
}
