import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
} from "lucide-react";

import { productApi } from "../api/productApi";
import { warehouseApi } from "../api/warehouseApi";
import { customerApi } from "../api/customerApi";
import { inventoryApi } from "../api/inventoryApi";
import { invoiceApi } from "../api/invoiceApi";

import type { Product } from "../types/product";
import type { Warehouse } from "../types/warehouse";
import type { Customer } from "../types/customer";
import type { InventoryStock } from "../types/inventory";

type CartItem = {
  product: Product;
  quantity: number;
};

const money = (value: number) =>
  value.toLocaleString("vi-VN") + " ₫";

function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (typeof data?.message === "string") {
      return data.message;
    }

    if (Array.isArray(data?.message)) {
      return data.message.join(", ");
    }

    if (typeof data?.title === "string") {
      return data.title;
    }

    if (error.response?.status === 409) {
      return "Không đủ tồn kho hoặc dữ liệu đã thay đổi.";
    }

    if (error.response?.status === 403) {
      return "Bạn không có quyền truy cập dữ liệu này hoặc chưa được phân công kho.";
    }
  }

  return error instanceof Error
    ? error.message
    : "Không thể thực hiện thao tác.";
}

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stocks, setStocks] = useState<InventoryStock[]>([]);

  const [warehouseId, setWarehouseId] = useState(0);
  const [customerId, setCustomerId] = useState("");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [stockStale, setStockStale] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [
          productData,
          warehouseData,
          customerData,
          stockData,
        ] = await Promise.all([
          productApi.getAll(),
          warehouseApi.getAll(),
          customerApi.getAll(),
          inventoryApi.getAll(),
        ]);

        if (!active) return;

        setProducts(productData);
        setWarehouses(warehouseData);
        setCustomers(customerData);
        setStocks(stockData);

        // Nếu nhân viên chỉ được truy cập một kho,
        // tự động chọn kho đó.
        if (warehouseData.length === 1) {
          setWarehouseId(warehouseData[0].id);
        }
      } catch (err) {
        if (active) setError(errorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  const availableStock = (productId: number) => {
    return stocks.find(
      (stock) =>
        stock.warehouseId === warehouseId &&
        stock.productId === productId
    )?.quantity ?? 0;
  };

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(keyword) ||
        product.sku.toLowerCase().includes(keyword)
      );
    });
  }, [products, search]);

  const totalAmount = cart.reduce(
    (sum, item) =>
      sum + item.product.salePrice * item.quantity,
    0
  );

  const totalQuantity = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const addToCart = (product: Product) => {
    setError("");
    setSuccess("");

    if (!warehouseId) {
      setError("Vui lòng chọn kho bán hàng.");
      return;
    }

    const stock = availableStock(product.id);

    const existing = cart.find(
      (item) => item.product.id === product.id
    );

    const currentQuantity = existing?.quantity ?? 0;

    if (currentQuantity >= stock) {
      setError(
        `Sản phẩm "${product.name}" chỉ còn ${stock} trong kho.`
      );
      return;
    }

    setCart((previous) => {
      const found = previous.find(
        (item) => item.product.id === product.id
      );

      if (found) {
        return previous.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...previous, { product, quantity: 1 }];
    });
  };

  const changeQuantity = (
    productId: number,
    quantity: number
  ) => {
    setError("");

    if (quantity <= 0) {
      setCart((previous) =>
        previous.filter(
          (item) => item.product.id !== productId
        )
      );

      return;
    }

    if (quantity > availableStock(productId)) {
      setError("Số lượng vượt quá tồn kho hiện tại.");
      return;
    }

    setCart((previous) =>
      previous.map((item) =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const handleCreateInvoice = async () => {
    setError("");
    setSuccess("");

    if (stockStale) {
      setError(
        "Dữ liệu tồn kho chưa được cập nhật. Vui lòng tải lại trang."
      );
      return;
    }

    if (!warehouseId) {
      setError("Vui lòng chọn kho.");
      return;
    }

    if (cart.length === 0) {
      setError("Giỏ hàng đang trống.");
      return;
    }

    if (
      cart.some(
        (item) =>
          item.quantity > availableStock(item.product.id)
      )
    ) {
      setError(
        "Tồn kho đã thay đổi. Vui lòng kiểm tra giỏ hàng."
      );
      return;
    }

    setSaving(true);

    try {
      // Bước 1: Tạo hóa đơn.
      const invoice = await invoiceApi.create({
        warehouseId,
        customerId: customerId
          ? Number(customerId)
          : null,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      });

      // Đến đây Backend đã xác nhận tạo hóa đơn thành công.
      setCart([]);

      setSuccess(
        `Đã tạo hóa đơn #${invoice.id} thành công.`
      );

      // Bước 2: Làm mới tồn kho.
      // Nếu bước này lỗi, KHÔNG được báo hóa đơn thất bại.
      try {
        const updatedStocks = await inventoryApi.getAll();
        setStocks(updatedStocks);
        setStockStale(false);
      } catch (refreshError) {
        console.error(
          "Không thể làm mới tồn kho:",
          refreshError
        );

        setError(
          "Hóa đơn đã tạo thành công, nhưng chưa thể cập nhật tồn kho trên màn hình. Vui lòng tải lại trang trước khi tiếp tục bán hàng."
        );
        setStockStale(true);
      }
    } catch (createError) {
      setError(errorMessage(createError));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Đang tải dữ liệu bán hàng...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Bán hàng
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Tạo hóa đơn và cập nhật tồn kho
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-lg bg-green-50 p-4 text-sm text-green-700"
        >
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          <div className="rounded-xl border bg-white p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Kho bán hàng
                </label>

                <select
                  value={warehouseId || ""}
                  onChange={(event) => {
                    setWarehouseId(Number(event.target.value));
                    setCart([]);
                    setError("");
                  }}
                  disabled={warehouses.length === 1}
                  className="w-full rounded-lg border p-3 disabled:bg-slate-100"
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
                <label className="mb-2 block text-sm font-medium">
                  Khách hàng
                </label>

                <select
                  value={customerId}
                  onChange={(event) =>
                    setCustomerId(event.target.value)
                  }
                  className="w-full rounded-lg border p-3"
                >
                  <option value="">Khách vãng lai</option>

                  {customers.map((customer) => (
                    <option
                      key={customer.id}
                      value={customer.id}
                    >
                      {customer.name}
                      {customer.phone
                        ? ` - ${customer.phone}`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-white">
            <div className="border-b p-5">
              <div className="flex items-center gap-2 rounded-lg border px-3">
                <Search
                  size={18}
                  className="text-slate-400"
                />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Tìm sản phẩm theo tên hoặc SKU..."
                  className="w-full py-3 outline-none"
                />
              </div>
            </div>

            <div className="max-h-[540px] overflow-y-auto">
              {filteredProducts.map((product) => {
                const stock = availableStock(product.id);

                return (
                  <div
                    key={product.id}
                    className="flex items-center justify-between gap-4 border-b p-5 last:border-b-0"
                  >
                    <div>
                      <h3 className="font-semibold">
                        {product.name}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        SKU: {product.sku}
                      </p>

                      <p className="mt-2 text-sm font-semibold text-blue-600">
                        {money(product.salePrice)}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Tồn kho: {stock}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      disabled={!warehouseId || stock <= 0}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
                    >
                      Thêm
                    </button>
                  </div>
                );
              })}

              {filteredProducts.length === 0 && (
                <p className="p-8 text-center text-slate-500">
                  Không tìm thấy sản phẩm.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-2 border-b pb-4">
            <ShoppingCart className="text-blue-600" />

            <h2 className="text-lg font-bold">
              Giỏ hàng ({totalQuantity})
            </h2>
          </div>

          <div className="max-h-[400px] space-y-4 overflow-y-auto py-5">
            {cart.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                Chưa có sản phẩm
              </p>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="border-b pb-4"
                >
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">
                        {item.product.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {money(item.product.salePrice)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        changeQuantity(item.product.id, 0)
                      }
                      aria-label="Xóa khỏi giỏ"
                      className="text-red-500"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          changeQuantity(
                            item.product.id,
                            item.quantity - 1
                          )
                        }
                        className="rounded border p-1"
                      >
                        <Minus size={15} />
                      </button>

                      <span className="text-sm font-semibold">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          changeQuantity(
                            item.product.id,
                            item.quantity + 1
                          )
                        }
                        className="rounded border p-1"
                      >
                        <Plus size={15} />
                      </button>
                    </div>

                    <span className="text-sm font-bold">
                      {money(
                        item.product.salePrice *
                          item.quantity
                      )}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t pt-5">
            <div className="flex justify-between text-sm">
              <span>Tổng số lượng</span>
              <span>{totalQuantity}</span>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="font-semibold">
                Tổng thanh toán dự kiến
              </span>

              <span className="text-xl font-bold text-blue-600">
                {money(totalAmount)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => void handleCreateInvoice()}
              disabled={saving || cart.length === 0 || stockStale}
              className="mt-5 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving
                ? "Đang tạo hóa đơn..."
                : "Xác nhận bán hàng"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
