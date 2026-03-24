export interface CreateDeliveryInput {
  customerId: string;
  addressLine: string;
  city: string;
  notes?: string;
}

export interface DeliveryRecord {
  id: string;
  customerId: string;
  addressLine: string;
  city: string;
  notes: string | null;
}

export interface DeliveryRepositoryPort {
  create(input: CreateDeliveryInput): Promise<DeliveryRecord>;
  findById(id: string): Promise<DeliveryRecord | null>;
}
