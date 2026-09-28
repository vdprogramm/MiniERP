import api from "./axios";
import type {
  Supplier,
  SupplierRequest,
} from "../types/supplier";

function extractSuppliers(data: unknown): Supplier[] {
  if (Array.isArray(data)) return data;

  if (data && typeof data === "object") {
    const result = data as Record<string, unknown>;

    if (Array.isArray(result.items)) return result.items;
    if (Array.isArray(result.data)) return result.data;
  }

  throw new Error("API nhà cung cấp trả về dữ liệu không hợp lệ.");
}

export const supplierApi = {
  getAll: async (search = ""): Promise<Supplier[]> => {
    const response = await api.get("/suppliers", {
      params: search ? { search } : undefined,
    });

    return extractSuppliers(response.data);
  },

  create: async (data: SupplierRequest) => {
    const response = await api.post("/suppliers", data);
    return response.data;
  },

  update: async (id: number, data: SupplierRequest) => {
    const response = await api.put(`/suppliers/${id}`, data);
    return response.data;
  },

  remove: async (id: number) => {
    await api.delete(`/suppliers/${id}`);
  },
};
