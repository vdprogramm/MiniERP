import {
  ArrowRight,
  ClipboardList,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

const actions = [
  {
    title: "Bán hàng",
    description: "Chọn sản phẩm và tạo hóa đơn cho khách hàng.",
    path: "/sales",
    icon: ShoppingCart,
    color: "text-blue-600",
  },
  {
    title: "Khách hàng",
    description: "Tra cứu và quản lý thông tin khách hàng.",
    path: "/customers",
    icon: Users,
    color: "text-emerald-600",
  },
  {
    title: "Sản phẩm",
    description: "Tra cứu sản phẩm và thông tin bán hàng.",
    path: "/products",
    icon: Package,
    color: "text-violet-600",
  },
  {
    title: "Lịch sử hóa đơn",
    description: "Xem các hóa đơn đã tạo.",
    path: "/invoices",
    icon: ClipboardList,
    color: "text-amber-600",
  },
];

export default function SalesDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Tổng quan bán hàng
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Quản lý hoạt động bán hàng tại cửa hàng.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.path}
              to={action.path}
              className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-400 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <Icon
                  size={28}
                  className={action.color}
                />

                <ArrowRight
                  size={18}
                  className="text-slate-400 transition group-hover:translate-x-1"
                />
              </div>

              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                {action.title}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {action.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
