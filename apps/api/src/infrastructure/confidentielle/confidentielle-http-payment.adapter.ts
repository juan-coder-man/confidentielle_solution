import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import type {
  confidentielleChargeInput,
  confidentielleChargeResult,
  confidentiellePaymentPort,
} from '@api/application/ports/confidentielle-payment.port';

function mapGatewayStatus(status: string): confidentielleChargeResult['status'] {
  const s = status.toUpperCase();
  if (s.includes('APPROVED') || s === 'APPROVED') return 'APPROVED';
  if (s.includes('DECLINED') || s === 'DECLINED') return 'DECLINED';
  if (s.includes('PENDING') || s === 'PENDING') return 'PENDING';
  return 'ERROR';
}

@Injectable()
export class confidentielleHttpPaymentAdapter implements confidentiellePaymentPort {
  constructor(private readonly config: ConfigService) {}

  async charge(input: confidentielleChargeInput): Promise<confidentielleChargeResult> {
    const baseUrl = this.config.getOrThrow<string>('confidentielle_BASE_URL').replace(/\/$/, '');
    const privateKey = this.config.getOrThrow<string>('confidentielle_PRIVATE_KEY');
    const url = `${baseUrl}/transactions`;

    const response = await axios.post<{
      data?: { id?: string; status?: string };
      id?: string;
      status?: string;
      error?: { reason?: string };
    }>(
      url,
      {
        amount_in_cents: input.amountInCents,
        currency: input.currency,
        customer_email: input.customerEmail,
        payment_method: {
          type: 'CARD',
          token: input.cardToken,
          installments: 1,
        },
        reference: input.reference,
      },
      {
        headers: {
          Authorization: `Bearer ${privateKey}`,
          'Content-Type': 'application/json',
        },
        validateStatus: () => true,
      },
    );

    const data = response.data;
    if (response.status >= 400 || typeof data !== 'object' || data === null) {
      const reason =
        typeof data?.error?.reason === 'string' ? data.error.reason : 'confidentielle_HTTP_ERROR';
      throw new Error(reason);
    }

    const payload = 'data' in data && data.data ? data.data : data;
    const id = payload.id;
    const statusRaw = payload.status ?? 'ERROR';

    if (!id) {
      const errMsg =
        typeof data.error?.reason === 'string' ? data.error.reason : 'confidentielle_REJECTED';
      throw new Error(errMsg);
    }

    return {
      confidentielleTransactionId: String(id),
      status: mapGatewayStatus(String(statusRaw)),
      rawStatus: String(statusRaw),
    };
  }
}
