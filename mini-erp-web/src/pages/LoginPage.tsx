import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LockKeyhole, Mail, Store } from "lucide-react";
import axios from "axios";

import api from "../api/axios";
import { getHomeRoute } from "../utils/roleRoutes";
import { getRoles } from "../utils/auth";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      // Giả định Backend trả về { accessToken: "..." }.
      // Nếu JSON thực tế khác, cần sửa dòng này.
      const token = response.data.accessToken;

      if (typeof token !== "string" || !token) {
        throw new Error("Backend không trả về accessToken");
      }

      sessionStorage.setItem("accessToken", token);

      navigate(getHomeRoute(getRoles()[0] ?? ""), { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ??
            "Đăng nhập thất bại. Kiểm tra email hoặc mật khẩu."
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Có lỗi xảy ra khi đăng nhập."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-20 blur-[100px]"></div>
      
      <div className="w-full max-w-md relative z-10 mx-4">
        <div className="rounded-3xl bg-white/70 backdrop-blur-xl p-10 shadow-2xl border border-white/50">
          <div className="mb-10 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
              <Store size={32} />
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Chào mừng trở lại
            </h1>

            <p className="mt-3 text-slate-500 font-medium">
              Đăng nhập vào hệ thống Mini ERP
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="mb-2.5 block text-sm font-semibold text-slate-700">
                Email
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white/50 px-4 transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/20">
                <Mail size={18} className="text-slate-400" />

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  className="w-full py-3.5 outline-none bg-transparent font-medium placeholder:text-slate-400 text-slate-700"
                />
              </div>
            </div>

            <div>
              <label className="mb-2.5 block text-sm font-semibold text-slate-700">
                Mật khẩu
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white/50 px-4 transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/20">
                <LockKeyhole
                  size={18}
                  className="text-slate-400"
                />

                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="w-full py-3.5 outline-none bg-transparent font-medium placeholder:text-slate-400 text-slate-700"
                />
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100 flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-900 py-4 font-semibold text-white transition-all hover:bg-slate-800 disabled:opacity-60 shadow-lg hover:shadow-xl hover:-translate-y-0.5 mt-2"
            >
              {loading ? "Đang xử lý..." : "Đăng nhập ngay"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
