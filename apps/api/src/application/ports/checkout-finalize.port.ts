export interface CheckoutFinalizePort {
  applyApprovedPayment(params: {
    transactionId: string;
    productId: string;
    quantity: number;
    confidentielleTransactionId: string;
  }): Promise<void>;
}
