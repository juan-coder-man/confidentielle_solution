import { useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@web/store/hooks';
import { openPaymentModal } from '@web/store/checkoutSlice';
import { formatCopFromCents } from '@web/utils/money';

export function ProductCatalog() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.catalog.items);
  const status = useAppSelector((s) => s.catalog.status);
  const error = useAppSelector((s) => s.catalog.error);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const byId = useMemo(() => {
    const m: Record<string, number> = {};
    for (const p of items) {
      m[p.id] = quantities[p.id] ?? 1;
    }
    return m;
  }, [items, quantities]);

  if (status === 'loading') {
    return <p className="muted">Cargando catálogo…</p>;
  }
  if (status === 'failed') {
    return <p className="banner error">{error}</p>;
  }

  return (
    <section aria-label="Catálogo">
      {items.map((p) => {
        const qty = byId[p.id] ?? 1;
        const canBuy = p.stock > 0;
        return (
          <article key={p.id} className="product-card">
            <img src={p.imageUrl} alt="" loading="lazy" width={600} height={400} />
            <div className="product-body">
              <h3 className="product-name">{p.name}</h3>
              <p className="product-desc">{p.description}</p>
              <div className="price-row">
                <div>
                  <strong>{formatCopFromCents(p.priceCents)}</strong>
                  <div className="muted" style={{ fontSize: '0.85rem', marginTop: 4 }}>
                    Stock: {p.stock}
                  </div>
                </div>
                <div className="qty" aria-label="Cantidad">
                  <button
                    type="button"
                    className="secondary"
                    disabled={!canBuy || qty <= 1}
                    onClick={() =>
                      setQuantities((q) => ({
                        ...q,
                        [p.id]: Math.max(1, (q[p.id] ?? 1) - 1),
                      }))
                    }
                  >
                    −
                  </button>
                  <span aria-live="polite">{qty}</span>
                  <button
                    type="button"
                    className="secondary"
                    disabled={!canBuy || qty >= p.stock}
                    onClick={() =>
                      setQuantities((q) => ({
                        ...q,
                        [p.id]: Math.min(p.stock, (q[p.id] ?? 1) + 1),
                      }))
                    }
                  >
                    +
                  </button>
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <button
                  type="button"
                  className="primary"
                  style={{ width: '100%' }}
                  disabled={!canBuy}
                  onClick={() => dispatch(openPaymentModal({ productId: p.id, quantity: qty }))}
                >
                  Pagar con tarjeta
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
