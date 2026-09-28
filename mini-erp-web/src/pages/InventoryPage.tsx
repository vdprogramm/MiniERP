import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import { inventoryApi } from "../api/inventoryApi";
import { warehouseApi } from "../api/warehouseApi";
import { productApi } from "../api/productApi";

import type {
  InventoryStock,
  InventoryRequest,
} from "../types/inventory";

import type { Warehouse } from "../types/warehouse";
import type { Product } from "../types/product";

type StockAction = "import" | "export";

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (typeof data?.message === "string") {
      return data.message;
    }

    if (Array.isArray(data?.errors)) {
      return data.errors.join(", ");
    }

    if (typeof data?.title === "string") {
      return data.title;
    }

    if (error.response?.status === 403) {
      return "Bạn không có quyền thực hiện thao tác này.";
    }

    if (error.response?.status === 409) {
      return "Không thể thực hiện do xung đột dữ liệu hoặc tồn kho không đủ.";
    }
  }

  return error instanceof Error
    ? error.message
    : "Có lỗi xảy ra. Vui lòng thử lại.";
}

export default function InventoryPage() {
  const [stocks, setStocks] = useState<InventoryStock[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState<StockAction>("import");

  const [form, setForm] = useState<InventoryRequest>({
    warehouseId: 0,
    productId: 0,
    quantity: 1,
  });

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [stockData, productData, warehouseData] =
        await Promise.all([
          inventoryApi.getAll(),
          productApi.getAll(),
          warehouseApi.getAll(),
        ]);

      setStocks(stockData);
      setProducts(productData);
      setWarehouses(warehouseData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const productMap = useMemo(
    () => new Map(products.map((item) => [item.id, item])),
    [products]
  );

  const warehouseMap = useMemo(
    () => new Map(warehouses.map((item) => [item.id, item])),
    [warehouses]
  );

  const filteredStocks = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return stocks.filter((stock) => {
      const product = productMap.get(stock.productId);

      const matchesWarehouse =
        !warehouseFilter ||
        stock.warehouseId === Number(warehouseFilter);

      const matchesSearch =
        !keyword ||
        product?.name.toLowerCase().includes(keyword) ||
        product?.sku.toLowerCase().includes(keyword);

      return matchesWarehouse && Boolean(matchesSearch);
    });
  }, [stocks, warehouseFilter, search, productMap]);

  const totalQuantity = filteredStocks.reduce(
    (sum, stock) => sum + stock.quantity,
    0
  );

  const lowStockCount = filteredStocks.filter(
    (stock) => stock.quantity < 10
  ).length;

  const openModal = (
    nextAction: StockAction,
    stock?: InventoryStock
  ) => {
    setAction(nextAction);

    setForm({
      warehouseId:
        stock?.warehouseId ??
        Number(warehouseFilter) ??
        0,

      productId: stock?.productId ?? 0,
      quantity: 1,
    });

    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setError("");
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (
      !Number.isInteger(form.quantity) ||
      form.quantity <= 0
    ) {
      setError("Số lượng phải là số nguyên lớn hơn 0.");
      return;
    }

    if (!form.warehouseId || !form.productId) {
      setError("Vui lòng chọn kho và sản phẩm.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (action === "import") {
        await inventoryApi.importStock(form);
      } else {
        await inventoryApi.exportStock(form);
      }

      setShowModal(false);

      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Quản lý tồn kho
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Theo dõi và điều chỉnh số lượng sản phẩm tại từng kho
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => void loadData()}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={17} />
            Làm mới
          </button>

          <button
            onClick={() => openModal("import")}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700"
          >
            <ArrowDownToLine size={18} />
            Nhập kho
          </button>

          <button
            onClick={() => openModal("export")}
            className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-700"
          >
            <ArrowUpFromLine size={18} />
            Xuất kho
          </button>
        </div>
      </div>

      {error && !showModal && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 p-4 text-sm text-red-600"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Số dòng tồn kho
          </p>

          <p className="mt-3 text-3xl font-bold">
            {filteredStocks.length}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Tổng số lượng
          </p>

          <div className="mt-3 flex items-center gap-3">
            <Boxes className="text-blue-600" />

            <p className="text-3xl font-bold">
              {totalQuantity.toLocaleString("vi-VN")}
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Số dòng tồn dưới 10
          </p>

          <p className="mt-3 text-3xl font-bold text-orange-600">
            {lowStockCount}
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm">
        <div className="flex flex-wrap gap-3 border-b p-5">
          <select
            value={warehouseFilter}
            onChange={(event) =>
              setWarehouseFilter(event.target.value)
            }
            className="rounded-lg border border-slate-300 px-3 py-2.5"
          >
            <option value="">Tất cả kho</option>

            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </option>
            ))}
          </select>

          <div className="flex min-w-48 flex-1 items-center gap-2 rounded-lg border border-slate-300 px-3">
            <Search size={18} className="text-slate-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm tên sản phẩm hoặc SKU..."
              className="w-full py-2.5 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-4">Sản phẩm</th>
                <th className="px-5 py-4">SKU</th>
                <th className="px-5 py-4">Kho</th>
                <th className="px-5 py-4">Tồn kho</th>
                <th className="px-5 py-4">Trạng thái</th>
                <th className="px-5 py-4 text-right">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center"
                  >
                    Đang tải tồn kho...
                  </td>
                </tr>
              ) : filteredStocks.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    Chưa có dữ liệu tồn kho.
                  </td>
                </tr>
              ) : (
                filteredStocks.map((stock) => {
                  const product = productMap.get(
                    stock.productId
                  );

                  const warehouse = warehouseMap.get(
                    stock.warehouseId
                  );

                  return (
                    <tr
                      key={stock.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 font-medium">
                        {product?.name ??
                          `Sản phẩm #${stock.productId}`}
                      </td>

                      <td className="px-5 py-4">
                        {product?.sku ?? "—"}
                      </td>

                      <td className="px-5 py-4">
                        {warehouse?.name ??
                          `Kho #${stock.warehouseId}`}
                      </td>

                      <td className="px-5 py-4 font-semibold">
                        {stock.quantity}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            stock.quantity === 0
                              ? "bg-red-100 text-red-700"
                              : stock.quantity < 10
                                ? "bg-orange-100 text-orange-700"
                                : "bg-green-100 text-green-700"
                          }`}
                        >
                          {stock.quantity === 0
                            ? "Hết hàng"
                            : stock.quantity < 10
                              ? "Sắp hết"
                              : "Còn hàng"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              openModal("import", stock)
                            }
                            className="rounded-lg p-2 text-green-600 hover:bg-green-50"
                            title="Nhập kho"
                            aria-label="Nhập kho"
                          >
                            <ArrowDownToLine size={18} />
                          </button>

                          <button
                            onClick={() =>
                              openModal("export", stock)
                            }
                            disabled={stock.quantity === 0}
                            className="rounded-lg p-2 text-orange-600 hover:bg-orange-50 disabled:opacity-40"
                            title="Xuất kho"
                            aria-label="Xuất kho"
                          >
                            <ArrowUpFromLine size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-5">
              <h2 className="text-xl font-bold">
                {action === "import"
                  ? "Nhập kho"
                  : "Xuất kho"}
              </h2>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Đóng"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(event) => void handleSubmit(event)}
              className="space-y-4 p-5"
            >
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Kho hàng
                </label>

                <select
                  required
                  value={form.warehouseId || ""}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      warehouseId: Number(event.target.value),
                    })
                  }
                  className="w-full rounded-lg border p-2.5"
                >
                  <option value="">Chọn kho</option>

                  {warehouses.map((warehouse) => (
                    <option
                      key={warehouse.id}
                      value={warehouse.id}
                    >
                      {warehouse.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Sản phẩm
                </label>

                <select
                  required
                  value={form.productId || ""}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      productId: Number(event.target.value),
                    })
                  }
                  className="w-full rounded-lg border p-2.5"
                >
                  <option value="">Chọn sản phẩm</option>

                  {products.map((product) => (
                    <option
                      key={product.id}
                      value={product.id}
                    >
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Số lượng
                </label>

                <input
                  required
                  type="number"
                  min="1"
                  step="1"
                  value={form.quantity}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      quantity: Number(event.target.value),
                    })
                  }
                  className="w-full rounded-lg border p-2.5"
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
                >
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border px-5 py-2.5"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className={`rounded-lg px-5 py-2.5 font-medium text-white disabled:opacity-60 ${
                    action === "import"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-orange-600 hover:bg-orange-700"
                  }`}
                >
                  {saving
                    ? "Đang xử lý..."
                    : action === "import"
                      ? "Xác nhận nhập"
                      : "Xác nhận xuất"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
