import axios from 'axios';

export interface CardTokenPayload {
  number: string;
  cvc: string;
  expMonth: string;
  expYear: string;
  cardHolder: string;
}

export async function createconfidentielleCardToken(payload: CardTokenPayload): Promise<string> {
  if (import.meta.env.VITE_confidentielle_MOCK === 'true') {
    void payload;
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}`;
    return `mock_tok_${id}`;
  }
  const base = import.meta.env.VITE_confidentielle_BASE_URL?.replace(/\/$/, '') ?? '';
  const pub = import.meta.env.VITE_confidentielle_PUBLIC_KEY ?? '';
  if (!base || !pub) {
    throw new Error('Faltan VITE_confidentielle_BASE_URL o VITE_confidentielle_PUBLIC_KEY (o usa VITE_confidentielle_MOCK=true)');
  }
  const { data, status } = await axios.post<{
    data?: { id?: string };
    error?: { reason?: string };
  }>(
    `${base}/tokens/cards`,
    {
      number: payload.number.replace(/\s/g, ''),
      cvc: payload.cvc,
      exp_month: payload.expMonth,
      exp_year: payload.expYear,
      card_holder: payload.cardHolder,
    },
    {
      headers: {
        Authorization: `Bearer ${pub}`,
        'Content-Type': 'application/json',
      },
      validateStatus: () => true,
    },
  );
  if (status >= 400) {
    throw new Error(data?.error?.reason ?? 'No se pudo tokenizar la tarjeta');
  }
  const id = data?.data?.id;
  if (!id) {
    throw new Error('Respuesta de tokenización inválida');
  }
  return id;
}
