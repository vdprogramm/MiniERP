import { useEffect, useState } from "react";
import axios from "axios";
import {
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { productApi } from "../api/productApi";
import type {
  Product,
  ProductRequest,
} from "../types/product";

const emptyForm: ProductRequest = {
  name: "",
  sku: "",
  category: "",
  costPrice: 0,
  salePrice: 0,
  description: "",
};

const formatMoney = (value: number) =>
  value.toLocaleString("vi-VN") + " ₫";

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (typeof data === "string") {
      return data;
    }

    if (typeof data?.message === "string") {
      return data.message;
    }

    if (typeof data?.title === "string") {
      return data.title;
    }
  }

  return "Có lỗi xảy ra. Vui lòng thử lại.";
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductRequest>(emptyForm);

  const loadProducts = async (keyword = "") => {
    setLoading(true);
    setError("");

    try {
      const data = await productApi.getAll(keyword);
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setError("");
    setShowModal(true);
  };

  const openEdit = (product: Product) => {
    setEditingId(product.id);

    setForm({
      name: product.name,
      sku: product.sku,
      category: product.category,
      costPrice: product.costPrice,
      salePrice: product.salePrice,
      description: product.description ?? "",
    });

    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
    setEditingId(null);
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (form.costPrice < 0 || form.salePrice < 0) {
      setError("Giá sản phẩm không được âm.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (editingId === null) {
        await productApi.create(form);
      } else {
        await productApi.update(editingId, form);
      }

      setShowModal(false);
      setEditingId(null);

      await loadProducts(search);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa sản phẩm "${product.name}"?`
    );

    if (!confirmed) return;

    setError("");

    try {
      await productApi.remove(product.id);
      await loadProducts(search);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Quản lý sản phẩm
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Danh sách sản phẩm trong hệ thống
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Thêm sản phẩm
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void loadProducts(search);
          }}
          className="flex gap-3 border-b border-slate-200 p-5"
        >
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-300 px-3">
            <Search size={18} className="text-slate-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo tên hoặc mã SKU..."
              className="w-full py-2.5 outline-none"
            />
          </div>

          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-5 text-white hover:bg-slate-800"
          >
            Tìm kiếm
          </button>
        </form>

        {error && !showModal && (
          <p
            role="alert"
            className="mx-5 mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600"
          >
            {error}
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-4">SKU</th>
                <th className="px-5 py-4">Tên sản phẩm</th>
                <th className="px-5 py-4">Danh mục</th>
                <th className="px-5 py-4">Giá vốn</th>
                <th className="px-5 py-4">Giá bán</th>
                <th className="px-5 py-4 text-right">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    Đang tải sản phẩm...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    Chưa có sản phẩm nào.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 font-medium">
                      {product.sku}
                    </td>

                    <td className="px-5 py-4">
                      {product.name}
                    </td>

                    <td className="px-5 py-4">
                      {product.category}
                    </td>

                    <td className="px-5 py-4">
                      {formatMoney(product.costPrice)}
                    </td>

                    <td className="px-5 py-4 font-semibold text-blue-600">
                      {formatMoney(product.salePrice)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(product)}
                          aria-label={`Sửa ${product.name}`}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          type="button"
                          onClick={() => void handleDelete(product)}
                          aria-label={`Xóa ${product.name}`}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-4 text-sm text-slate-500">
          Tổng cộng: {products.length} sản phẩm
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-5">
              <h2 className="text-xl font-bold">
                {editingId === null
                  ? "Thêm sản phẩm"
                  : "Cập nhật sản phẩm"}
              </h2>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Đóng"
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(event) => void handleSubmit(event)}
              className="space-y-4 p-5"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Tên sản phẩm
                  </label>

                  <input
                    required
                    value={form.name}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        name: event.target.value,
                      })
                    }
                    className="w-full rounded-lg border p-2.5"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Mã SKU
                  </label>

                  <input
                    required
                    value={form.sku}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        sku: event.target.value,
                      })
                    }
                    className="w-full rounded-lg border p-2.5"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Danh mục
                  </label>

                  <input
                    required
                    value={form.category}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        category: event.target.value,
                      })
                    }
                    className="w-full rounded-lg border p-2.5"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Giá vốn
                  </label>

                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.costPrice}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        costPrice: Number(event.target.value),
                      })
                    }
                    className="w-full rounded-lg border p-2.5"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Giá bán
                  </label>

                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.salePrice}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        salePrice: Number(event.target.value),
                      })
                    }
                    className="w-full rounded-lg border p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Mô tả
                </label>

                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      description: event.target.value,
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
                  className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? "Đang lưu..." : "Lưu sản phẩm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
