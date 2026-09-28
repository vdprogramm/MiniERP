import api from "./axios";

export type RecentInvoice = {
  id: number;
  totalAmount: number;
  createdAt: string;
};

export type AssignedWarehouse = {
  id: number;
  name: string;
};

export type BranchDashboard = {
  warehouses: AssignedWarehouse[];
  employeeCount: number;
  productCount: number;
  totalStock: number;
  lowStockCount: number;
  invoiceCount: number;
  totalRevenue: number;
  todayRevenue: number;
  recentInvoices: RecentInvoice[];
};

export const branchDashboardApi = {
  getDashboard: async (): Promise<BranchDashboard> => {
    const response = await api.get<BranchDashboard>(
      "/branch-dashboard"
    );

    return response.data;
  },
};
