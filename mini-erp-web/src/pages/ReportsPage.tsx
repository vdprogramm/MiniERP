import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { RefreshCw } from "lucide-react";

import {
  reportApi,
  type RevenueByDay,
  type TopProduct,
} from "../api/reportApi";

const money = (value: number) =>
  value.toLocaleString("vi-VN") + " ₫";

function localDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function ReportsPage() {
  const [from, setFrom] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 29);
    return localDate(date);
  });

  const [to, setTo] = useState(() => localDate(new Date()));

  const [revenue, setRevenue] = useState<RevenueByDay[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [revenueLoaded, setRevenueLoaded] = useState(false);

  const loadReports = async () => {
    if (from > to) {
      setError("Ngày bắt đầu không được sau ngày kết thúc.");
      return;
    }

    setLoading(true);
    setError("");
    setRevenueLoaded(false);

    // Chuyển ngày theo giờ máy người dùng sang ISO UTC.
    const fromDate = new Date(`${from}T00:00:00`).toISOString();

    const endExclusive = new Date(`${to}T00:00:00`);
    endExclusive.setDate(endExclusive.getDate() + 1);

    const toDate = endExclusive.toISOString();

    const [revenueResult, productsResult] =
      await Promise.allSettled([
        reportApi.revenue(fromDate, toDate),
        reportApi.topProducts(5),
      ]);

    const errors: string[] = [];

    if (revenueResult.status === "fulfilled") {
      setRevenue(revenueResult.value);
      setRevenueLoaded(true);
    } else {
      console.error(
        "Lỗi Revenue API:",
        revenueResult.reason
      );

      setRevenue([]);
      errors.push("Không tải được báo cáo doanh thu");
    }

    if (productsResult.status === "fulfilled") {
      setTopProducts(productsResult.value);
    } else {
      console.error(
        "Lỗi Top Products API:",
        productsResult.reason
      );

      setTopProducts([]);
      errors.push("Không tải được sản phẩm bán chạy");
    }

    setError(errors.join(". "));
    setLoading(false);
  };

  useEffect(() => {
    void loadReports();
    // Tải lần đầu; các lần sau dùng nút Xem báo cáo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalRevenue = revenue.reduce(
    (sum, item) => sum + item.revenue,
    0
  );

  const totalInvoices = revenue.reduce(
    (sum, item) => sum + item.invoiceCount,
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Báo cáo kinh doanh
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Doanh thu theo ngày và sản phẩm bán chạy
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-4 rounded-xl border bg-white p-5">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Từ ngày
          </label>

          <input
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className="rounded-lg border p-2.5"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Đến ngày
          </label>

          <input
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="rounded-lg border p-2.5"
          />
        </div>

        <button
          onClick={() => void loadReports()}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white disabled:opacity-50"
        >
          <RefreshCw size={17} />
          {loading ? "Đang tải..." : "Xem báo cáo"}
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-4 text-red-600"
        >
          {error}
        </p>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-6">
          <p className="text-sm text-slate-500">
            Doanh thu trong khoảng đã chọn
          </p>

          <p className="mt-3 text-3xl font-bold text-blue-600">
            {revenueLoaded ? money(totalRevenue) : "—"}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-6">
          <p className="text-sm text-slate-500">
            Số hóa đơn trong khoảng đã chọn
          </p>

          <p className="mt-3 text-3xl font-bold">
            {revenueLoaded ? totalInvoices.toLocaleString("vi-VN") : "—"}
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-6 text-lg font-bold">
          Biểu đồ doanh thu theo ngày
        </h2>

        {revenue.length === 0 ? (
          <p className="py-16 text-center text-slate-500">
            Không có dữ liệu trong khoảng thời gian này.
          </p>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenue}>
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
      </div>

      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-5 text-lg font-bold">
          Top 5 sản phẩm bán chạy
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3">Sản phẩm</th>
                <th className="px-4 py-3">Đã bán</th>
                <th className="px-4 py-3">Doanh thu</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {topProducts.map((product) => (
                <tr key={product.productId}>
                  <td className="px-4 py-4 font-medium">
                    {product.productName}
                  </td>

                  <td className="px-4 py-4">
                    {product.quantitySold}
                  </td>

                  <td className="px-4 py-4 font-semibold text-blue-600">
                    {money(product.revenue)}
                  </td>
                </tr>
              ))}

              {topProducts.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="py-8 text-center text-slate-500"
                  >
                    Chưa có dữ liệu bán hàng.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
