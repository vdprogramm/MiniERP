import api from "./axios";
import type { Product, ProductRequest } from "../types/product";

export const productApi = {
  getAll: async (search?: string): Promise<Product[]> => {
    const response = await api.get("/products", {
      params: search ? { search } : undefined,
    });

    const data = response.data;

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.items)) {
      return data.items;
    }

    if (Array.isArray(data?.data)) {
      return data.data;
    }

    if (Array.isArray(data?.products)) {
      return data.products;
    }

    console.error("Unexpected products response:", data);

    throw new Error("API trả về danh sách sản phẩm không đúng định dạng.");
  },

  create: async (data: ProductRequest): Promise<Product> => {
    const response = await api.post<Product>("/products", data);
    return response.data;
  },

  update: async (
    id: number,
    data: ProductRequest
  ): Promise<Product> => {
    const response = await api.put<Product>(
      `/products/${id}`,
      data
    );

    return response.data;
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};
