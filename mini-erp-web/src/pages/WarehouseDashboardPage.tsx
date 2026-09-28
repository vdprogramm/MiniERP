import { useEffect, useState } from "react";
import {
  Boxes,
  ClipboardList,
  Package,
  RefreshCw,
  Warehouse,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/axios";

type ApiRecord = Record<string, unknown>;

function getArray(data: unknown): ApiRecord[] {
  if (Array.isArray(data)) return data;

  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;

    if (Array.isArray(obj.items)) return obj.items;
    if (Array.isArray(obj.data)) return obj.data;
  }

  return [];
}

export default function WarehouseDashboardPage() {
  const [warehouseCount, setWarehouseCount] =
    useState<number | null>(null);
  const [stockCount, setStockCount] =
    useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    const [warehousesResult, inventoryResult] =
      await Promise.allSettled([
        api.get("/warehouses"),
        api.get("/inventory"),
      ]);

    const errors: string[] = [];

    if (warehousesResult.status === "fulfilled") {
      setWarehouseCount(
        getArray(warehousesResult.value.data).length
      );
    } else {
      setWarehouseCount(null);
      errors.push("Không tải được danh sách kho");
    }

    if (inventoryResult.status === "fulfilled") {
      setStockCount(
        getArray(inventoryResult.value.data).length
      );
    } else {
      setStockCount(null);
      errors.push("Không tải được dữ liệu tồn kho");
    }

    setError(errors.join(". "));
    setLoading(false);
  };

  useEffect(() => {
    void loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Tổng quan kho
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi kho hàng và thực hiện nghiệp vụ nhập xuất.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadData()}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Làm mới
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Warehouse className="text-blue-600" size={24} />
            <span className="text-slate-600">
              Số kho quản lý
            </span>
          </div>

          <p className="mt-4 text-3xl font-bold">
            {loading ? "..." : warehouseCount ?? "—"}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Boxes className="text-emerald-600" size={24} />
            <span className="text-slate-600">
              Số dòng tồn kho
            </span>
          </div>

          <p className="mt-4 text-3xl font-bold">
            {loading ? "..." : stockCount ?? "—"}
          </p>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Thao tác nhanh
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <Link
            to="/warehouses"
            className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-blue-400 hover:shadow-sm"
          >
            <Warehouse size={28} className="text-blue-600" />
            <h3 className="mt-3 font-semibold">Quản lý kho</h3>
            <p className="mt-1 text-sm text-slate-500">
              Xem danh sách và thông tin kho hàng.
            </p>
          </Link>

          <Link
            to="/inventory"
            className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-blue-400 hover:shadow-sm"
          >
            <Package size={28} className="text-emerald-600" />
            <h3 className="mt-3 font-semibold">Tồn kho</h3>
            <p className="mt-1 text-sm text-slate-500">
              Theo dõi số lượng hàng hóa trong kho.
            </p>
          </Link>

          <Link
            to="/inventory"
            className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-blue-400 hover:shadow-sm"
          >
            <ClipboardList
              size={28}
              className="text-amber-600"
            />
            <h3 className="mt-3 font-semibold">Nhập / xuất hàng</h3>
            <p className="mt-1 text-sm text-slate-500">
              Thực hiện nghiệp vụ nhập và xuất kho.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
