import api from "./axios";

import type {
  InventoryStock,
  InventoryRequest,
} from "../types/inventory";

function extractArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) {
    return data as T[];
  }

  if (data && typeof data === "object") {
    const value = data as Record<string, unknown>;

    if (Array.isArray(value.items)) {
      return value.items as T[];
    }

    if (Array.isArray(value.data)) {
      return value.data as T[];
    }
  }

  throw new Error(
    "API tồn kho trả về danh sách không đúng định dạng."
  );
}

export const inventoryApi = {
  getAll: async (): Promise<InventoryStock[]> => {
    const response = await api.get("/inventory");

    return extractArray<InventoryStock>(response.data);
  },

  importStock: async (
    data: InventoryRequest
  ): Promise<void> => {
    // Kiểm tra dòng tồn kho đã tồn tại hay chưa.
    const stocks = await inventoryApi.getAll();

    const exists = stocks.some(
      (stock) =>
        stock.warehouseId === data.warehouseId &&
        stock.productId === data.productId
    );

    if (exists) {
      // Đã có sản phẩm trong kho: cộng thêm số lượng.
      await api.post("/inventory/adjust", {
        warehouseId: data.warehouseId,
        productId: data.productId,
        quantityChange: data.quantity,
      });
    } else {
      // Chưa có sản phẩm trong kho: tạo dòng tồn kho.
      await api.post("/inventory", {
        warehouseId: data.warehouseId,
        productId: data.productId,
        quantity: data.quantity,
      });
    }
  },

  exportStock: async (
    data: InventoryRequest
  ): Promise<void> => {
    // Xuất kho: giảm số lượng.
    await api.post("/inventory/adjust", {
      warehouseId: data.warehouseId,
      productId: data.productId,
      quantityChange: -data.quantity,
    });
  },
};
