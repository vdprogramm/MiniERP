import { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";

import { employeeApi } from "../api/employeeApi";
import type { Employee, EmployeeRequest } from "../types/employee";
import { warehouseApi } from "../api/warehouseApi";
import type { Warehouse } from "../types/warehouse";

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (typeof data?.message === "string") return data.message;
    if (Array.isArray(data?.message)) return data.message.join(", ");
    if (typeof data?.title === "string") return data.title;
  }
  return error instanceof Error ? error.message : "Có lỗi xảy ra.";
}

export default function EmployeesPage() {
  const [items, setItems] = useState<Employee[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<EmployeeRequest>({
    name: "",
    email: "",
    password: "",
    position: "SALES_STAFF",
    warehouseIds: [],
  });

  const loadData = async (keyword = "") => {
    setLoading(true);
    setError("");
    try {
      const data = await employeeApi.getAll(keyword);
      setItems(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();

    warehouseApi.getAll()
      .then(setWarehouses)
      .catch((err) => {
        console.error("Không tải được danh sách kho:", err);
        setError(
          "Không tải được danh sách kho. Vui lòng kiểm tra quyền truy cập."
        );
      });
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      name: "",
      email: "",
      password: "",
      position: "SALES_STAFF",
      warehouseIds: [],
    });
    setError("");
    setShowModal(true);
  };

  const openEdit = (item: Employee) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      email: item.email,
      password: "", // Bỏ trống khi sửa
      position: item.position,
      warehouseIds: item.warehouseIds ? [...item.warehouseIds] : [],
    });
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingId === null) {
        await employeeApi.create(form);
      } else {
        const currentEmployee = items.find(
          (item) => item.id === editingId
        );

        if (!currentEmployee) {
          throw new Error("Không tìm thấy nhân viên cần sửa.");
        }

        // Chỉ gọi API khi vai trò thay đổi.
        if (currentEmployee.position !== form.position) {
          await employeeApi.updateRole(
            editingId,
            form.position
          );
        }

        // Chỉ gọi API khi kho được phân công thay đổi.
        const oldIds = [...(currentEmployee.warehouseIds || [])].sort(
          (a, b) => a - b
        );
        const newIds = [...form.warehouseIds].sort(
          (a, b) => a - b
        );
        const warehousesChanged =
          JSON.stringify(oldIds) !== JSON.stringify(newIds);

        if (warehousesChanged) {
          await employeeApi.updateWarehouses(
            editingId,
            form.warehouseIds
          );
        }
      }

      setShowModal(false);
      setEditingId(null);

      await loadData(search);
    } catch (err) {
      setError(getErrorMessage(err));

      // Có thể một thay đổi đã lưu thành công trước khi
      // request tiếp theo thất bại. Tải lại dữ liệu thực tế.
      try {
        const latest = await employeeApi.getAll(search);
        setItems(latest);
      } catch {
        // Giữ thông báo lỗi ban đầu.
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: Employee) => {
    if (!window.confirm(`Xóa nhân viên "${item.name}"?`)) return;
    setError("");
    try {
      await employeeApi.remove(item.id);
      await loadData(search);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý nhân sự</h1>
          <p className="mt-1 text-sm text-slate-500">Tạo tài khoản và phân quyền cho nhân viên</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700">
          <Plus size={18} /> Thêm nhân viên
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <form onSubmit={(e) => { e.preventDefault(); void loadData(search); }} className="flex gap-3 border-b p-5">
          <div className="flex flex-1 items-center gap-2 rounded-lg border px-3">
            <Search size={18} className="text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm kiếm nhân viên..." className="w-full py-2.5 outline-none" />
          </div>
          <button type="submit" className="rounded-lg bg-slate-900 px-5 text-white">Tìm kiếm</button>
        </form>

        {error && !showModal && <p className="mx-5 mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-4">ID</th>
                <th className="px-5 py-4">Tên</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Vị trí (Role)</th>
                <th className="px-5 py-4">Chi nhánh</th>
                <th className="px-5 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center">Đang tải...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-500">Chưa có dữ liệu.</td></tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">#{item.id}</td>
                    <td className="px-5 py-4 font-medium">{item.name}</td>
                    <td className="px-5 py-4">{item.email}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {item.position}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {warehouses
                        .filter((w) => (item.warehouseIds || []).includes(w.id))
                        .map((w) => w.name)
                        .join(", ") || "Chưa phân công"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(item)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"><Pencil size={18} /></button>
                        <button onClick={() => void handleDelete(item)} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={18} /></button>
                      </div>
                    </td>
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
              <h2 className="text-xl font-bold">{editingId === null ? "Thêm" : "Cập nhật"} nhân viên</h2>
              <button type="button" onClick={closeModal}><X size={20} /></button>
            </div>
            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 p-5">
              <div>
                <label className="mb-1 block text-sm font-medium">Họ tên</label>
                <input required disabled={editingId !== null} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border p-2.5" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input type="email" required disabled={editingId !== null} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border p-2.5" />
              </div>
              {editingId === null && (
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Mật khẩu
                  </label>

                  <input
                    type="password"
                    required
                    minLength={8}
                    value={form.password ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="w-full rounded-lg border p-2.5"
                  />
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm font-medium">Vị trí (Role)</label>
                <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="w-full rounded-lg border p-2.5">
                  <option value="WAREHOUSE_MANAGER">Quản lý kho</option>
                  <option value="SALES_STAFF">Nhân viên bán hàng</option>
                  <option value="BRANCH_MANAGER">Quản lý chi nhánh</option>
                  <option value="ADMIN">Quản trị viên (Admin)</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Kho / chi nhánh được phân công
                </label>

                <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border p-3">
                  {warehouses.map((warehouse) => (
                    <label
                      key={warehouse.id}
                      className="flex cursor-pointer items-center gap-3"
                    >
                      <input
                        type="checkbox"
                        checked={form.warehouseIds.includes(warehouse.id)}
                        onChange={(event) => {
                          const warehouseIds = event.target.checked
                            ? [...form.warehouseIds, warehouse.id]
                            : form.warehouseIds.filter((id) => id !== warehouse.id);

                          setForm({
                            ...form,
                            warehouseIds,
                          });
                        }}
                      />
                      <span>{warehouse.name}</span>
                    </label>
                  ))}

                  {warehouses.length === 0 && (
                    <p className="text-sm text-amber-600">
                      Chưa có kho để phân công.
                    </p>
                  )}
                </div>
              </div>

              {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
              <div className="flex justify-end gap-3 border-t pt-4">
                <button type="button" onClick={closeModal} disabled={saving} className="rounded-lg border px-5 py-2.5">Hủy</button>
                <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white">{saving ? "Đang lưu..." : "Lưu thông tin"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
