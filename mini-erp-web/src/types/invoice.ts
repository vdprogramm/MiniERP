export type InvoiceItemRequest = {
  productId: number;
  quantity: number;
};

export type CreateInvoiceRequest = {
  warehouseId: number;
  customerId: number | null;
  items: InvoiceItemRequest[];
};

export type InvoiceDetail = {
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type Invoice = {
  id: number;
  warehouseId: number;
  employeeId: number;
  customerId: number | null;
  totalAmount: number;
  createdAt: string;
  details: InvoiceDetail[];
};
