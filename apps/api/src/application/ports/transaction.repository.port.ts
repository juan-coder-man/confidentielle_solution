import type { StoreTransactionStatus } from '@api/domain/store-transaction-status';

export interface StoreTransactionRecord {
  id: string;
  publicNumber: string;
  status: StoreTransactionStatus;
  productId: string;
  quantity: number;
  customerId: string;
  deliveryId: string;
  subtotalCents: number;
  baseFeeCents: number;
  deliveryFeeCents: number;
  totalCents: number;
  confidentielleTransactionId: string | null;
  idempotencyKey: string | null;
}

export interface CreateStoreTransactionInput {
  publicNumber: string;
  productId: string;
  quantity: number;
  customerId: string;
  deliveryId: string;
  subtotalCents: number;
  baseFeeCents: number;
  deliveryFeeCents: number;
  totalCents: number;
}

export interface StoreTransactionRepositoryPort {
  create(input: CreateStoreTransactionInput): Promise<StoreTransactionRecord>;
  findById(id: string): Promise<StoreTransactionRecord | null>;
  updateStatus(
    id: string,
    status: StoreTransactionStatus,
    confidentielleTransactionId?: string | null,
  ): Promise<void>;
  setIdempotencyKey(id: string, key: string): Promise<void>;
}
