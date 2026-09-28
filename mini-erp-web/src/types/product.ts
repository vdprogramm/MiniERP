export type Product = {
  id: number;
  name: string;
  sku: string;
  category: string;
  costPrice: number;
  salePrice: number;
  description: string | null;
};

export type ProductRequest = {
  name: string;
  sku: string;
  category: string;
  costPrice: number;
  salePrice: number;
  description: string;
};
