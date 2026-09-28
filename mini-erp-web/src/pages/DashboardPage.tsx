import { useEffect, useState } from "react";
import axios from "axios";

import {
  AlertTriangle,
  BarChart3,
  DollarSign,
  Package,
  Receipt,
  RefreshCw,
  Users,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import api from "../api/axios";
import {
  reportApi,
  type RevenueByDay,
  type TopProduct,
} from "../api/reportApi";

type Dashboard = {
  totalRevenue: number;
  totalInvoices: number;
  totalProducts: number;
  totalCustomers: number;
  lowStockCount: number;
};

const money = (value: number) =>
  value.toLocaleString("vi-VN") + " ₫";

const COLORS = [
  "#10b981", // green
  "#3b82f6", // blue
  "#f59e0b", // yellow
  "#8b5cf6", // purple
  "#ef4444", // red
];

function getLastSevenDaysUtc() {
  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);
  end.setUTCDate(end.getUTCDate() + 1);

  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 7);

  return {
    from: start.toISOString(),
    to: end.toISOString(),
  };
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;

    return typeof message === "string"
      ? message
      : "Không thể tải dữ liệu thống kê.";
  }

  return "Không thể tải dữ liệu thống kê.";
}

export default function DashboardPage() {
  const [dashboard, setDashboard] =
    useState<Dashboard | null>(null);

  const [revenue, setRevenue] =
    useState<RevenueByDay[]>([]);

  const [topProducts, setTopProducts] =
    useState<TopProduct[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    const { from, to } = getLastSevenDaysUtc();

    const results = await Promise.allSettled([
      api.get<Dashboard>("/reports/dashboard"),
      reportApi.revenue(from, to),
      reportApi.topProducts(5),
    ]);

    const errors: string[] = [];

    const [dashboardResult, revenueResult, productsResult] =
      results;

    if (dashboardResult.status === "fulfilled") {
      setDashboard(dashboardResult.value.data);
    } else {
      setDashboard(null);
      errors.push(getErrorMessage(dashboardResult.reason));
    }

    if (revenueResult.status === "fulfilled") {
      setRevenue(revenueResult.value);
    } else {
      setRevenue([]);
      errors.push("Không tải được biểu đồ doanh thu.");
    }

    if (productsResult.status === "fulfilled") {
      setTopProducts(productsResult.value);
    } else {
      setTopProducts([]);
      errors.push("Không tải được sản phẩm bán chạy.");
    }

    setError(errors.join(" "));
    setLoading(false);
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  const cards = dashboard
    ? [
        {
          title: "Tổng doanh thu",
          value: money(dashboard.totalRevenue),
          icon: DollarSign,
        },
        {
          title: "Tổng hóa đơn",
          value: dashboard.totalInvoices.toLocaleString("vi-VN"),
          icon: Receipt,
        },
        {
          title: "Sản phẩm",
          value: dashboard.totalProducts.toLocaleString("vi-VN"),
          icon: Package,
        },
        {
          title: "Khách hàng",
          value: dashboard.totalCustomers.toLocaleString("vi-VN"),
          icon: Users,
        },
        {
          title: "Dòng tồn kho thấp",
          value: dashboard.lowStockCount.toLocaleString("vi-VN"),
          icon: AlertTriangle,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Tổng quan hệ thống
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Giám sát doanh thu, hoạt động bán hàng và tồn kho
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadDashboard()}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={17} />
          {loading ? "Đang tải..." : "Làm mới"}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 p-4 text-sm text-red-600"
        >
          {error}
        </div>
      )}

      {loading && !dashboard && (
        <p className="text-sm text-slate-500">
          Đang tải thống kê...
        </p>
      )}

      {dashboard && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-slate-500">
                    {card.title}
                  </p>

                  <Icon
                    size={20}
                    className="shrink-0 text-blue-600"
                  />
                </div>

                <p className="mt-4 break-words text-xl font-bold text-slate-900">
                  {card.value}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-6 flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-600" />

            <div>
              <h2 className="font-semibold text-slate-900">
                Doanh thu 7 ngày gần nhất
              </h2>

              <p className="text-xs text-slate-500">
                Theo ngày UTC
              </p>
            </div>
          </div>

          {revenue.length === 0 ? (
            <p className="py-24 text-center text-sm text-slate-500">
              Chưa có dữ liệu doanh thu trong khoảng này.
            </p>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={revenue}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="date"
                    tickFormatter={(value: string) =>
                      value.slice(5, 10)
                    }
                  />

                  <YAxis
                    width={65}
                    tickFormatter={(value: number) =>
                      new Intl.NumberFormat("vi-VN", {
                        notation: "compact",
                      }).format(value)
                    }
                  />

                  <Tooltip
                    formatter={(value) =>
                      money(Number(value ?? 0))
                    }
                  />

                  <Bar
                    dataKey="revenue"
                    name="Doanh thu"
                    fill="#2563eb"
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-6">
            <h2 className="font-semibold text-slate-900">
              Top 5 sản phẩm bán chạy
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Xếp theo số lượng đã bán, tính trên toàn bộ dữ liệu
            </p>
          </div>

          {topProducts.length === 0 ? (
            <p className="py-24 text-center text-sm text-slate-500">
              Chưa có dữ liệu sản phẩm bán chạy.
            </p>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topProducts}
                    dataKey="quantitySold"
                    nameKey="productName"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) =>
                      `${name} (${((percent || 0) * 100).toFixed(1)}%)`
                    }
                  >
                    {topProducts.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) =>
                      Number(value ?? 0).toLocaleString("vi-VN")
                    }
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
        <h2 className="font-semibold text-slate-900">
          Phạm vi thống kê
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          KPI tổng quan lấy dữ liệu toàn hệ thống. Biểu đồ doanh
          thu hiển thị 7 ngày gần nhất theo UTC; sản phẩm bán
          chạy được tính trên toàn bộ lịch sử hóa đơn.
          Để lọc khoảng thời gian khác, sử dụng trang
          Báo cáo & thống kê.
        </p>
      </div>
    </div>
  );
}
