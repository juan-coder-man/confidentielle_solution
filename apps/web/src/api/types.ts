export interface ProductDto {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  stock: number;
  imageUrl: string;
}

export interface TransactionDetailDto {
  id: string;
  publicNumber: string;
  status: string;
  quantity: number;
  subtotalCents: number;
  baseFeeCents: number;
  deliveryFeeCents: number;
  totalCents: number;
  confidentielleTransactionId: string | null;
  product: {
    id: string;
    name: string;
    description: string;
    priceCents: number;
    imageUrl: string;
  };
  customer: {
    fullName: string;
    email: string;
    phone: string;
  };
  delivery: {
    addressLine: string;
    city: string;
    notes: string | null;
  };
}

export interface CreateTransactionResponseDto {
  transactionId: string;
  publicNumber: string;
  status: string;
  totals: {
    subtotalCents: number;
    baseFeeCents: number;
    deliveryFeeCents: number;
    totalCents: number;
  };
}

export interface PayTransactionResponseDto {
  status: string;
  confidentielleTransactionId: string | null;
  publicNumber: string;
}
