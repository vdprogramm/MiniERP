import { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";

export type CrudField<T> = {
  key: keyof T & string;
  label: string;
  type?: "text" | "email" | "tel";
  required?: boolean;
};

type CrudEntity = {
  id: number;
  name: string;
};

type Props<T extends CrudEntity, TRequest extends object> = {
  title: string;
  description: string;
  entityLabel: string;
  fields: CrudField<TRequest>[];
  emptyForm: TRequest;
  loadItems: (search: string) => Promise<T[]>;
  createItem: (data: TRequest) => Promise<unknown>;
  updateItem: (id: number, data: TRequest) => Promise<unknown>;
  deleteItem: (id: number) => Promise<unknown>;
  toForm: (item: T) => TRequest;
};

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (typeof data?.message === "string") return data.message;

    if (Array.isArray(data?.message)) {
      return data.message.join(", ");
    }

    if (typeof data?.title === "string") return data.title;

    if (error.response?.status === 403) {
      return "Bạn không có quyền thực hiện thao tác này.";
    }

    if (error.response?.status === 409) {
      return "Dữ liệu bị trùng hoặc đang được sử dụng.";
    }
  }

  return error instanceof Error
    ? error.message
    : "Có lỗi xảy ra. Vui lòng thử lại.";
}

export default function CrudPage<
  T extends CrudEntity,
  TRequest extends object
>({
  title,
  description,
  entityLabel,
  fields,
  emptyForm,
  loadItems,
  createItem,
  updateItem,
  deleteItem,
  toForm,
}: Props<T, TRequest>) {
  const [items, setItems] = useState<T[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<TRequest>({ ...emptyForm });

  const loadData = async (keyword = "") => {
    setLoading(true);
    setError("");

    try {
      const data = await loadItems(keyword);
      setItems(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    // Chỉ tải danh sách khi component được mở.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setError("");
    setShowModal(true);
  };

  const openEdit = (item: T) => {
    setEditingId(item.id);
    setForm(toForm(item));
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

    setSaving(true);
    setError("");

    try {
      if (editingId === null) {
        await createItem(form);
      } else {
        await updateItem(editingId, form);
      }

      setShowModal(false);
      setEditingId(null);

      await loadData(search);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: T) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa ${entityLabel} "${item.name}"?`
    );

    if (!confirmed) return;

    setError("");

    try {
      await deleteItem(item.id);
      await loadData(search);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const updateField = (key: keyof TRequest, value: string) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {title}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Thêm {entityLabel}
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void loadData(search);
          }}
          className="flex gap-3 border-b p-5"
        >
          <div className="flex flex-1 items-center gap-2 rounded-lg border px-3">
            <Search size={18} className="text-slate-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Tìm kiếm ${entityLabel}...`}
              className="w-full py-2.5 outline-none"
            />
          </div>

          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-5 text-white"
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
                <th className="px-5 py-4">ID</th>

                {fields.map((field) => (
                  <th key={field.key} className="px-5 py-4">
                    {field.label}
                  </th>
                ))}

                <th className="px-5 py-4 text-right">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={fields.length + 2}
                    className="px-5 py-10 text-center"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={fields.length + 2}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    Chưa có dữ liệu.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">#{item.id}</td>

                    {fields.map((field) => (
                      <td key={field.key} className="px-5 py-4">
                        {String(
                          (item as Record<string, unknown>)[field.key] ??
                            "—"
                        )}
                      </td>
                    ))}

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          aria-label={`Sửa ${item.name}`}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          type="button"
                          onClick={() => void handleDelete(item)}
                          aria-label={`Xóa ${item.name}`}
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

        <div className="border-t px-5 py-4 text-sm text-slate-500">
          Tổng cộng: {items.length}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-5">
              <h2 className="text-xl font-bold">
                {editingId === null ? "Thêm" : "Cập nhật"}{" "}
                {entityLabel}
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
              {fields.map((field) => (
                <div key={field.key}>
                  <label className="mb-1 block text-sm font-medium">
                    {field.label}
                  </label>

                  <input
                    type={field.type ?? "text"}
                    required={field.required}
                    value={String(
                      (form as Record<string, unknown>)[field.key] ??
                        ""
                    )}
                    onChange={(event) =>
                      updateField(field.key, event.target.value)
                    }
                    className="w-full rounded-lg border p-2.5"
                  />
                </div>
              ))}

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
                  {saving ? "Đang lưu..." : "Lưu thông tin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
