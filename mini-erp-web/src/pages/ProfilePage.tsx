import { useEffect, useState } from "react";
import { profileApi } from "../api/profileApi";
import type { Profile } from "../api/profileApi";

const roleNames: Record<string, string> = {
  ADMIN: "Quản trị viên",
  BRANCH_MANAGER: "Quản lý chi nhánh",
  WAREHOUSE_MANAGER: "Quản lý kho",
  SALES_STAFF: "Nhân viên bán hàng",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    profileApi
      .get()
      .then(setProfile)
      .catch(() => setError("Không thể tải hồ sơ cá nhân."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Đang tải hồ sơ...</p>;

  if (error) return <p className="text-red-600">{error}</p>;

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">
          Hồ sơ cá nhân
        </h1>
        <p className="text-gray-500">
          Thông tin tài khoản và quyền truy cập
        </p>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">
            {profile.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 className="text-xl font-semibold">
              {profile.name}
            </h2>
            <p className="text-gray-500">
              {profile.email}
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">Mã nhân viên</p>
            <p className="font-medium">#{profile.id}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Vai trò</p>
            <p className="font-medium">
              {roleNames[profile.position] ?? profile.position}
            </p>
          </div>
        </div>

        <hr className="my-6" />

        <h3 className="mb-3 font-semibold">
          Kho được phân công
        </h3>

        {profile.warehouses.length === 0 ? (
          <p className="text-gray-500">
            Chưa được phân công kho.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile.warehouses.map((warehouse) => (
              <span
                key={warehouse.id}
                className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700"
              >
                {warehouse.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
