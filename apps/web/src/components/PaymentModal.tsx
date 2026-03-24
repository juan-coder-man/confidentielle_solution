import { FormEvent, useMemo, useState } from 'react';
import { createPendingTransaction } from '@web/api/client';
import type { CardDraft } from '@web/checkout/card-draft';
import { useAppDispatch, useAppSelector } from '@web/store/hooks';
import {
  closePaymentModal,
  setSummaryAfterCreate,
} from '@web/store/checkoutSlice';
import {
  detectCardBrand,
  luhnValid,
  normalizeExpiry,
  type CardBrand,
} from '@web/utils/card';

function BrandBadge({ brand }: { brand: CardBrand }) {
  if (brand === 'visa') {
    return (
      <span className="card-brand" aria-label="Visa">
        <span style={{ fontWeight: 700, letterSpacing: 1 }}>VISA</span>
      </span>
    );
  }
  if (brand === 'mastercard') {
    return (
      <span className="card-brand" aria-label="Mastercard">
        <span style={{ fontWeight: 700 }}>Mastercard</span>
      </span>
    );
  }
  return <span className="card-brand" />;
}

export function PaymentModal({
  onCardDraft,
}: {
  onCardDraft: (draft: CardDraft) => void;
}) {
  const dispatch = useAppDispatch();
  const step = useAppSelector((s) => s.checkout.step);
  const selectedProductId = useAppSelector((s) => s.checkout.selectedProductId);
  const quantity = useAppSelector((s) => s.checkout.quantity);
  const product = useAppSelector((s) =>
    s.catalog.items.find((p) => p.id === selectedProductId),
  );

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cvc, setCvc] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const brand = useMemo(() => detectCardBrand(cardNumber), [cardNumber]);

  if (step !== 'payment_modal' || !selectedProductId || !product) {
    return null;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const exp = normalizeExpiry(expMonth, expYear);
    if (!exp) {
      setFormError('Revisa la fecha de vencimiento (MM / AAAA).');
      return;
    }
    if (!luhnValid(cardNumber)) {
      setFormError('El número de tarjeta no es válido (checksum).');
      return;
    }
    setSubmitting(true);
    try {
      const res = await createPendingTransaction({
        productId: selectedProductId,
        quantity,
        customer: { fullName, email, phone },
        delivery: { addressLine, city, notes: notes || undefined },
      });
      onCardDraft({
        number: cardNumber.replace(/\s/g, ''),
        cvc,
        expMonth: exp.mm,
        expYear: exp.yy,
        cardHolder,
      });
      dispatch(
        setSummaryAfterCreate({
          transactionId: res.transactionId,
          publicNumber: res.publicNumber,
          totals: res.totals,
        }),
      );
      setCardNumber('');
      setCvc('');
    } catch {
      setFormError('No se pudo crear la transacción. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-title"
      >
        <h2 id="payment-title">Datos de tarjeta y envío</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          Producto: <strong>{product.name}</strong> × {quantity}
        </p>
        {formError ? <div className="banner error">{formError}</div> : null}
        <form onSubmit={onSubmit}>
          <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
            <legend className="sr-only">Tarjeta</legend>
            <div className="field">
              <label htmlFor="pan">Número de tarjeta</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  id="pan"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="•••• •••• •••• ••••"
                  value={cardNumber}
                  onChange={(ev) => setCardNumber(ev.target.value)}
                  required
                />
                <BrandBadge brand={brand} />
              </div>
            </div>
            <div className="row-2">
              <div className="field">
                <label htmlFor="expM">Mes</label>
                <input
                  id="expM"
                  inputMode="numeric"
                  placeholder="MM"
                  value={expMonth}
                  onChange={(ev) => setExpMonth(ev.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="expY">Año</label>
                <input
                  id="expY"
                  inputMode="numeric"
                  placeholder="AA / AAAA"
                  value={expYear}
                  onChange={(ev) => setExpYear(ev.target.value)}
                  required
                />
              </div>
            </div>
            <div className="row-2">
              <div className="field">
                <label htmlFor="cvc">CVC</label>
                <input
                  id="cvc"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  value={cvc}
                  onChange={(ev) => setCvc(ev.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="holder">Titular</label>
                <input
                  id="holder"
                  autoComplete="cc-name"
                  value={cardHolder}
                  onChange={(ev) => setCardHolder(ev.target.value)}
                  required
                />
              </div>
            </div>
          </fieldset>
          <fieldset style={{ border: 'none', margin: '16px 0 0', padding: 0 }}>
            <legend className="sr-only">Entrega</legend>
            <div className="field">
              <label htmlFor="fullName">Nombre completo</label>
              <input
                id="fullName"
                value={fullName}
                onChange={(ev) => setFullName(ev.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="email">Correo</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="phone">Teléfono</label>
              <input
                id="phone"
                inputMode="tel"
                value={phone}
                onChange={(ev) => setPhone(ev.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="addr">Dirección</label>
              <input
                id="addr"
                value={addressLine}
                onChange={(ev) => setAddressLine(ev.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="city">Ciudad</label>
              <input
                id="city"
                value={city}
                onChange={(ev) => setCity(ev.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="notes">Notas (opcional)</label>
              <textarea
                id="notes"
                rows={2}
                value={notes}
                onChange={(ev) => setNotes(ev.target.value)}
              />
            </div>
          </fieldset>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button
              type="button"
              className="secondary"
              style={{ flex: 1 }}
              onClick={() => dispatch(closePaymentModal())}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button type="submit" className="primary" style={{ flex: 1 }} disabled={submitting}>
              {submitting ? 'Guardando…' : 'Continuar al resumen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
