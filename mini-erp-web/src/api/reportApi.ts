import api from "./axios";

export type DashboardReport = {
  totalRevenue: number;
  totalInvoices: number;
  totalProducts: number;
  totalCustomers: number;
  lowStockCount: number;
};

export type RevenueByDay = {
  date: string;
  revenue: number;
  invoiceCount: number;
};

export type TopProduct = {
  productId: number;
  productName: string;
  quantitySold: number;
  revenue: number;
};

function extractArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];

  if (data && typeof data === "object") {
    const result = data as Record<string, unknown>;

    if (Array.isArray(result.items)) {
      return result.items as T[];
    }

    if (Array.isArray(result.data)) {
      return result.data as T[];
    }
  }

  throw new Error("API báo cáo trả về danh sách không hợp lệ.");
}

export const reportApi = {
  dashboard: async (): Promise<DashboardReport> => {
    const response = await api.get<DashboardReport>(
      "/reports/dashboard"
    );

    return response.data;
  },

  revenue: async (
    from: string,
    to: string
  ): Promise<RevenueByDay[]> => {
    const response = await api.get("/reports/revenue", {
      params: { from, to },
    });

    return extractArray<RevenueByDay>(response.data);
  },

  topProducts: async (
    limit = 5
  ): Promise<TopProduct[]> => {
    const response = await api.get("/reports/top-products", {
      params: { limit },
    });

    return extractArray<TopProduct>(response.data);
  },
};
