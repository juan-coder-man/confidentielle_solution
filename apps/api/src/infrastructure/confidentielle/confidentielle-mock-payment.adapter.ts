import { Injectable } from '@nestjs/common';
import type {
  confidentielleChargeInput,
  confidentielleChargeResult,
  confidentiellePaymentPort,
} from '@api/application/ports/confidentielle-payment.port';
import { randomUUID } from 'crypto';

@Injectable()
export class confidentielleMockPaymentAdapter implements confidentiellePaymentPort {
  async charge(input: confidentielleChargeInput): Promise<confidentielleChargeResult> {
    void input;
    return {
      confidentielleTransactionId: `mock_${randomUUID()}`,
      status: 'APPROVED',
      rawStatus: 'APPROVED',
    };
  }
}
