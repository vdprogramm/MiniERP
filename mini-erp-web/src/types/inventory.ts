export type InventoryStock = {
  id: number;
  warehouseId: number;
  productId: number;
  quantity: number;
};

export type InventoryRequest = {
  warehouseId: number;
  productId: number;
  quantity: number;
};
