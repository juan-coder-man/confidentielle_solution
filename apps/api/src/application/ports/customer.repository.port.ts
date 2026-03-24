export interface CreateCustomerInput {
  fullName: string;
  email: string;
  phone: string;
}

export interface CustomerRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface CustomerRepositoryPort {
  create(input: CreateCustomerInput): Promise<CustomerRecord>;
  findById(id: string): Promise<CustomerRecord | null>;
}
