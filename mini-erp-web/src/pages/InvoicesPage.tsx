import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Plus, RefreshCw } from "lucide-react";

import { invoiceApi } from "../api/invoiceApi";
import type { Invoice } from "../types/invoice";

const money = (value: number) =>
  value.toLocaleString("vi-VN") + " ₫";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await invoiceApi.getAll();
      setInvoices(data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ??
            "Không thể tải danh sách hóa đơn."
        );
      } else {
        setError("Không thể tải danh sách hóa đơn.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Quản lý hóa đơn
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Lịch sử giao dịch bán hàng
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => void load()}
            className="rounded-lg border bg-white p-2.5"
            aria-label="Làm mới"
          >
            <RefreshCw size={18} />
          </button>

          <Link
            to="/sales"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-white"
          >
            <Plus size={18} />
            Bán hàng
          </Link>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 p-4 text-red-600">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-4">Mã hóa đơn</th>
              <th className="px-5 py-4">Ngày tạo</th>
              <th className="px-5 py-4">Kho</th>
              <th className="px-5 py-4">Nhân viên</th>
              <th className="px-5 py-4">Khách hàng</th>
              <th className="px-5 py-4">Tổng tiền</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center">
                  Đang tải...
                </td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center">
                  Chưa có hóa đơn.
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-5 py-4 font-semibold">
                    #{invoice.id}
                  </td>

                  <td className="px-5 py-4">
                    {new Date(
                      invoice.createdAt
                    ).toLocaleString("vi-VN")}
                  </td>

                  <td className="px-5 py-4">
                    #{invoice.warehouseId}
                  </td>

                  <td className="px-5 py-4">
                    #{invoice.employeeId}
                  </td>

                  <td className="px-5 py-4">
                    {invoice.customerId
                      ? `#${invoice.customerId}`
                      : "Khách vãng lai"}
                  </td>

                  <td className="px-5 py-4 font-semibold text-blue-600">
                    {money(invoice.totalAmount)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
