import api from "./axios";
import type {
  Customer,
  CustomerRequest,
} from "../types/customer";

function extractCustomers(data: unknown): Customer[] {
  if (Array.isArray(data)) return data;

  if (data && typeof data === "object") {
    const result = data as Record<string, unknown>;

    if (Array.isArray(result.items)) return result.items;
    if (Array.isArray(result.data)) return result.data;
  }

  throw new Error("API khách hàng trả về dữ liệu không hợp lệ.");
}

export const customerApi = {
  getAll: async (search = ""): Promise<Customer[]> => {
    const response = await api.get("/customers", {
      params: search ? { search } : undefined,
    });

    return extractCustomers(response.data);
  },

  create: async (data: CustomerRequest) => {
    const response = await api.post("/customers", data);
    return response.data;
  },

  update: async (id: number, data: CustomerRequest) => {
    const response = await api.put(`/customers/${id}`, data);
    return response.data;
  },

  remove: async (id: number) => {
    await api.delete(`/customers/${id}`);
  },
};
