import axios from 'axios';
import type {
  CreateTransactionResponseDto,
  PayTransactionResponseDto,
  ProductDto,
  TransactionDetailDto,
} from '@web/api/types';

const baseURL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? '';

export const api = axios.create({ baseURL });

export async function fetchProducts(): Promise<ProductDto[]> {
  const { data } = await api.get<ProductDto[]>('/products');
  return data;
}

export async function createPendingTransaction(body: {
  productId: string;
  quantity: number;
  customer: { fullName: string; email: string; phone: string };
  delivery: { addressLine: string; city: string; notes?: string };
}): Promise<CreateTransactionResponseDto> {
  const { data } = await api.post<CreateTransactionResponseDto>('/transactions', body);
  return data;
}

export async function fetchTransaction(id: string): Promise<TransactionDetailDto> {
  const { data } = await api.get<TransactionDetailDto>(`/transactions/${id}`);
  return data;
}

export async function payTransaction(
  id: string,
  cardToken: string,
  idempotencyKey: string,
): Promise<PayTransactionResponseDto> {
  const { data } = await api.post<PayTransactionResponseDto>(
    `/transactions/${id}/pay`,
    { cardToken },
    { headers: { 'Idempotency-Key': idempotencyKey } },
  );
  return data;
}
