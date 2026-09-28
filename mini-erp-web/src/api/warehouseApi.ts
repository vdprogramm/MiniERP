import api from "./axios";

import type {
  Warehouse,
  WarehouseRequest,
  EmployeeOption,
} from "../types/warehouse";

function extractArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];

  if (data && typeof data === "object") {
    const value = data as Record<string, unknown>;

    if (Array.isArray(value.items)) {
      return value.items as T[];
    }

    if (Array.isArray(value.data)) {
      return value.data as T[];
    }
  }

  throw new Error("API trả về danh sách không đúng định dạng.");
}

export const warehouseApi = {
  getAll: async (): Promise<Warehouse[]> => {
    const response = await api.get("/warehouses");

    return extractArray<Warehouse>(response.data);
  },

  create: async (
    data: WarehouseRequest
  ): Promise<Warehouse> => {
    const response = await api.post("/warehouses", data);

    return response.data;
  },

  update: async (
    id: number,
    data: WarehouseRequest
  ): Promise<Warehouse> => {
    const response = await api.put(
      `/warehouses/${id}`,
      data
    );

    return response.data;
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/warehouses/${id}`);
  },

  getEmployees: async (): Promise<EmployeeOption[]> => {
    const response = await api.get("/employees");

    return extractArray<EmployeeOption>(response.data);
  },
};
