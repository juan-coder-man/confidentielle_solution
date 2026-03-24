export interface ProductRecord {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  stock: number;
  imageUrl: string;
}

export interface ProductRepositoryPort {
  findAll(): Promise<ProductRecord[]>;
  findById(id: string): Promise<ProductRecord | null>;
  decrementStock(productId: string, quantity: number): Promise<void>;
}
