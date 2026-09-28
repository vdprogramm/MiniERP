import { Navigate, Outlet } from "react-router-dom";

import {
  hasRole,
  isAuthenticated,
} from "../utils/auth";

type Props = {
  roles?: readonly string[];
};

export default function ProtectedRoute({ roles }: Props) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !hasRole(roles)) {
    return (
      <div className="rounded-xl border bg-white p-8">
        <h1 className="text-xl font-bold text-red-600">
          Không có quyền truy cập
        </h1>

        <p className="mt-2 text-slate-500">
          Tài khoản của bạn không được phép sử dụng chức năng này.
        </p>
      </div>
    );
  }

  return <Outlet />;
}
