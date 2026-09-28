export type Supplier = {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
};

export type SupplierRequest = {
  name: string;
  phone: string;
  address: string;
};
