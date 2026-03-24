export interface confidentielleChargeInput {
  amountInCents: number;
  currency: string;
  customerEmail: string;
  cardToken: string;
  reference: string;
}

export interface confidentielleChargeResult {
  confidentielleTransactionId: string;
  status: 'APPROVED' | 'DECLINED' | 'PENDING' | 'ERROR';
  rawStatus?: string;
}

export interface confidentiellePaymentPort {
  charge(input: confidentielleChargeInput): Promise<confidentielleChargeResult>;
}
