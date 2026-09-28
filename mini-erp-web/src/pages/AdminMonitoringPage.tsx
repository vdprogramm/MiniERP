import { useEffect, useState } from "react";
import axios from "axios";
import {
  AlertTriangle,
  Boxes,
  RefreshCw,
  Users,
  Warehouse,
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

type WarehouseMonitoring = {
  warehouseId: number;
  warehouseName: string;
  employeeCount: number;
  stockLines: number;
  totalQuantity: number;
  lowStockLines: number;
  invoiceCount: number;
  revenue: number;
};

const money = (value: number) =>
  value.toLocaleString("vi-VN") + " ₫";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#f97316",
];

export default function AdminMonitoringPage() {
  const [warehouses, setWarehouses] = useState<
    WarehouseMonitoring[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get<WarehouseMonitoring[]>(
        "/admin/monitoring/warehouses"
      );

      setWarehouses(response.data);
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message ??
              "Không tải được dữ liệu giám sát."
          : "Không tải được dữ liệu giám sát."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const totals = warehouses.reduce(
    (result, warehouse) => ({
      employees: result.employees + warehouse.employeeCount,
      quantity: result.quantity + warehouse.totalQuantity,
      lowStock: result.lowStock + warehouse.lowStockLines,
      revenue: result.revenue + warehouse.revenue,
    }),
    {
      employees: 0,
      quantity: 0,
      lowStock: 0,
      revenue: 0,
    }
  );

  const cards = [
    {
      title: "Số kho",
      value: warehouses.length.toLocaleString("vi-VN"),
      icon: Warehouse,
    },
    {
      title: "Lượt phân công nhân viên",
      value: totals.employees.toLocaleString("vi-VN"),
      icon: Users,
    },
    {
      title: "Tổng số lượng tồn",
      value: totals.quantity.toLocaleString("vi-VN"),
      icon: Boxes,
    },
    {
      title: "Dòng tồn kho thấp",
      value: totals.lowStock.toLocaleString("vi-VN"),
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Giám sát hoạt động kho
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Theo dõi tồn kho, nhân viên và doanh thu theo từng kho
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadData()}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={loading ? "animate-spin" : ""}
          />
          Làm mới
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 p-4 text-red-600"
        >
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">
          Đang tải dữ liệu giám sát...
        </p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.title}
                  className="rounded-xl border bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                      {card.title}
                    </p>

                    <Icon size={21} className="text-blue-600" />
                  </div>

                  <p className="mt-4 text-2xl font-bold">
                    {card.value}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">
                Doanh thu theo kho (Cột)
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Doanh thu lũy kế từ các hóa đơn đã lưu
              </p>

              {warehouses.length === 0 ? (
                <p className="py-16 text-center text-slate-500">
                  Chưa có kho để giám sát.
                </p>
              ) : (
                <div className="mt-6 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={warehouses}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="warehouseName"
                        tick={{ fontSize: 12 }}
                      />

                      <YAxis
                        width={75}
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

            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">
                Tỷ trọng doanh thu (Tròn)
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Phân bổ doanh thu giữa các kho
              </p>

              {warehouses.length === 0 ? (
                <p className="py-16 text-center text-slate-500">
                  Chưa có kho để giám sát.
                </p>
              ) : (
                <div className="mt-6 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={warehouses}
                        dataKey="revenue"
                        nameKey="warehouseName"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }) =>
                          `${name} (${((percent || 0) * 100).toFixed(1)}%)`
                        }
                      >
                        {warehouses.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) =>
                          money(Number(value ?? 0))
                        }
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>
          </div>

          <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
            <div className="p-5">
              <h2 className="text-lg font-semibold">
                Chi tiết từng kho
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Kho</th>
                    <th className="px-4 py-3">Nhân viên</th>
                    <th className="px-4 py-3">Dòng tồn</th>
                    <th className="px-4 py-3">Số lượng tồn</th>
                    <th className="px-4 py-3">Tồn thấp</th>
                    <th className="px-4 py-3">Hóa đơn</th>
                    <th className="px-4 py-3">Doanh thu</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {warehouses.map((warehouse) => (
                    <tr key={warehouse.warehouseId}>
                      <td className="px-4 py-4 font-medium">
                        {warehouse.warehouseName}
                      </td>

                      <td className="px-4 py-4">
                        {warehouse.employeeCount}
                      </td>

                      <td className="px-4 py-4">
                        {warehouse.stockLines}
                      </td>

                      <td className="px-4 py-4">
                        {warehouse.totalQuantity}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={
                            warehouse.lowStockLines > 0
                              ? "font-semibold text-amber-600"
                              : "text-slate-600"
                          }
                        >
                          {warehouse.lowStockLines}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        {warehouse.invoiceCount}
                      </td>

                      <td className="px-4 py-4 font-semibold text-blue-600">
                        {money(warehouse.revenue)}
                      </td>
                    </tr>
                  ))}

                  {warehouses.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-10 text-center text-slate-500"
                      >
                        Chưa có dữ liệu kho.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <p className="text-xs text-slate-500">
            Số nhân viên là số lượt phân công vào kho; một người
            được phân công nhiều kho sẽ được tính ở mỗi kho.
            Tồn kho thấp được xác định khi số lượng ≤ 5.
          </p>
        </>
      )}
    </div>
  );
}
