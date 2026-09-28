import api from "./axios";

import type {
  CreateInvoiceRequest,
  Invoice,
} from "../types/invoice";

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

  throw new Error("API hóa đơn trả về danh sách không hợp lệ.");
}

export const invoiceApi = {
  getAll: async (): Promise<Invoice[]> => {
    const response = await api.get("/invoices");

    return extractArray<Invoice>(response.data);
  },

  getById: async (id: number): Promise<Invoice> => {
    const response = await api.get<Invoice>(`/invoices/${id}`);

    return response.data;
  },

  create: async (
    data: CreateInvoiceRequest
  ): Promise<Invoice> => {
    const response = await api.post<Invoice>(
      "/invoices",
      data
    );

    return response.data;
  },
};
