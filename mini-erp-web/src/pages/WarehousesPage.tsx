import { useEffect, useState } from "react";
import axios from "axios";

import {
  Plus,
  Pencil,
  Trash2,
  Warehouse as WarehouseIcon,
  X,
} from "lucide-react";

import { warehouseApi } from "../api/warehouseApi";
import { hasRole, ROLES } from "../utils/auth";

import type {
  Warehouse,
  WarehouseRequest,
  EmployeeOption,
} from "../types/warehouse";

const emptyForm: WarehouseRequest = {
  name: "",
  location: "",
  managerId: null,
};

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (typeof data?.message === "string") {
      return data.message;
    }

    if (typeof data?.title === "string") {
      return data.title;
    }

    if (error.response?.status === 403) {
      return "Bạn không có quyền thực hiện thao tác này.";
    }
  }

  return error instanceof Error
    ? error.message
    : "Có lỗi xảy ra. Vui lòng thử lại.";
}

export default function WarehousesPage() {
  const isAdmin = hasRole([ROLES.ADMIN]);

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<WarehouseRequest>({
    ...emptyForm,
  });

  const loadWarehouses = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await warehouseApi.getAll();
      setWarehouses(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadWarehouses();
  }, []);

  const openCreate = async () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setError("");
    setEmployees([]);
    setShowModal(true);

    if (isAdmin) {
      try {
        const data = await warehouseApi.getEmployees();
        setEmployees(data);
      } catch (err) {
        setError(
          `Không tải được danh sách nhân viên: ${getErrorMessage(err)}`
        );
      }
    }
  };

  const openEdit = async (warehouse: Warehouse) => {
    setEditingId(warehouse.id);

    setForm({
      name: warehouse.name,
      location: warehouse.location,
      managerId: warehouse.managerId,
    });

    setError("");
    setEmployees([]);
    setShowModal(true);

    if (isAdmin) {
      try {
        const data = await warehouseApi.getEmployees();
        setEmployees(data);
      } catch (err) {
        setError(
          `Không tải được danh sách nhân viên: ${getErrorMessage(err)}`
        );
      }
    }
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
    setError("");
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      if (editingId === null) {
        await warehouseApi.create(form);
      } else {
        await warehouseApi.update(editingId, form);
      }

      setShowModal(false);
      setEditingId(null);

      await loadWarehouses();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (warehouse: Warehouse) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa kho "${warehouse.name}"?`
    );

    if (!confirmed) return;

    setError("");

    try {
      await warehouseApi.remove(warehouse.id);
      await loadWarehouses();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const getManagerName = (warehouse: Warehouse) => {
    return warehouse.managerName ?? "Chưa phân công";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Quản lý kho hàng
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Quản lý các kho thuộc hệ thống bán lẻ
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => void openCreate()}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            Thêm kho
          </button>
        )}
      </div>

      {error && !showModal && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 p-4 text-sm text-red-600"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <WarehouseIcon className="text-blue-600" />

            <span className="text-sm text-slate-500">
              Tổng số kho
            </span>
          </div>

          <p className="mt-4 text-3xl font-bold">
            {warehouses.length}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-4">ID</th>
                <th className="px-5 py-4">Tên kho</th>
                <th className="px-5 py-4">Địa điểm</th>
                <th className="px-5 py-4">Người quản lý</th>
                {isAdmin && (
                  <th className="px-5 py-4 text-right">
                    Thao tác
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 5 : 4}
                    className="px-5 py-10 text-center"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : warehouses.length === 0 ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 5 : 4}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    Chưa có kho hàng nào.
                  </td>
                </tr>
              ) : (
                warehouses.map((warehouse) => (
                  <tr
                    key={warehouse.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      #{warehouse.id}
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      {warehouse.name}
                    </td>

                    <td className="px-5 py-4">
                      {warehouse.location}
                    </td>

                    <td className="px-5 py-4">
                      {getManagerName(warehouse)}
                    </td>

                    {isAdmin && (
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => void openEdit(warehouse)}
                            aria-label={`Sửa ${warehouse.name}`}
                            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            onClick={() => void handleDelete(warehouse)}
                            aria-label={`Xóa ${warehouse.name}`}
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
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
                {editingId === null
                  ? "Thêm kho hàng"
                  : "Cập nhật kho hàng"}
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
                  Tên kho
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
                  placeholder="Ví dụ: Kho Hà Nội"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Địa điểm
                </label>

                <input
                  required
                  value={form.location}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      location: event.target.value,
                    })
                  }
                  className="w-full rounded-lg border p-2.5"
                  placeholder="Ví dụ: Cầu Giấy, Hà Nội"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Người quản lý
                </label>

                <select
                  value={form.managerId ?? ""}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      managerId: event.target.value
                        ? Number(event.target.value)
                        : null,
                    })
                  }
                  className="w-full rounded-lg border p-2.5"
                >
                  <option value="">Chưa phân công</option>

                  {employees.map((employee) => (
                    <option
                      key={employee.id}
                      value={employee.id}
                    >
                      {employee.name}
                    </option>
                  ))}
                </select>
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
                  className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white disabled:opacity-60"
                >
                  {saving ? "Đang lưu..." : "Lưu kho hàng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
