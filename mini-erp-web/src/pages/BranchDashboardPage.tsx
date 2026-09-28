import { useEffect, useState } from "react";
import axios from "axios";
import {
  Building2,
  Users,
  Package,
  Boxes,
  AlertTriangle,
  Receipt,
  Wallet,
  TrendingUp,
} from "lucide-react";

import {
  branchDashboardApi,
  type BranchDashboard,
} from "../api/branchDashboardApi";

function formatMoney(value: number) {
  return value.toLocaleString("vi-VN") + " ₫";
}

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;

    if (typeof message === "string") {
      return message;
    }

    if (error.response?.status === 403) {
      return "Bạn chưa được phân công chi nhánh hoặc không có quyền truy cập.";
    }
  }

  return "Không tải được dữ liệu chi nhánh.";
}

export default function BranchDashboardPage() {
  const [data, setData] = useState<BranchDashboard | null>(
    null
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const result =
          await branchDashboardApi.getDashboard();

        if (active) {
          setData(result);
        }
      } catch (err) {
        if (active) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <p className="text-slate-500">
        Đang tải dữ liệu chi nhánh...
      </p>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-5 text-red-700">
        {error}
      </div>
    );
  }

  if (!data) {
    return <p>Không có dữ liệu chi nhánh.</p>;
  }

  const cards = [
    {
      label: "Nhân viên",
      value: data.employeeCount,
      icon: Users,
    },
    {
      label: "Sản phẩm trong kho",
      value: data.productCount,
      icon: Package,
    },
    {
      label: "Tổng số lượng tồn",
      value: data.totalStock,
      icon: Boxes,
    },
    {
      label: "Sản phẩm tồn thấp",
      value: data.lowStockCount,
      icon: AlertTriangle,
    },
    {
      label: "Hóa đơn",
      value: data.invoiceCount,
      icon: Receipt,
    },
    {
      label: "Tổng doanh thu",
      value: formatMoney(data.totalRevenue),
      icon: Wallet,
    },
    {
      label: "Doanh thu hôm nay (UTC)",
      value: formatMoney(data.todayRevenue),
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <Building2 className="text-blue-600" size={28} />

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Tổng quan chi nhánh
            </h1>

            <p className="text-sm text-slate-500">
              Quản lý {data.warehouses.length} kho:{" "}
              {data.warehouses.map((w) => w.name).join(", ")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  {card.label}
                </span>

                <Icon
                  size={20}
                  className="text-blue-600"
                />
              </div>

              <p className="mt-4 text-2xl font-bold text-slate-900">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b p-5">
          <h2 className="text-lg font-bold">
            Hóa đơn gần đây
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Chỉ hiển thị hóa đơn thuộc chi nhánh này
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-4">Mã hóa đơn</th>
                <th className="px-5 py-4">Ngày tạo</th>
                <th className="px-5 py-4 text-right">
                  Tổng tiền
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {data.recentInvoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    Chi nhánh chưa có hóa đơn.
                  </td>
                </tr>
              ) : (
                data.recentInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-5 py-4 font-medium">
                      #{invoice.id}
                    </td>

                    <td className="px-5 py-4">
                      {new Date(
                        invoice.createdAt
                      ).toLocaleString("vi-VN", {
                        timeZone: "Asia/Ho_Chi_Minh",
                      })}
                    </td>

                    <td className="px-5 py-4 text-right font-semibold">
                      {formatMoney(invoice.totalAmount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
