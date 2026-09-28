import { NavLink, Outlet, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Package,
  Warehouse,
  Boxes,
  Users,
  Truck,
  Receipt,
  BarChart3,
  LogOut,
  ShoppingCart,
  UserCog,
  User,
} from "lucide-react";

import {
  getRoles,
  logout,
  ROLES,
} from "../utils/auth";

const menus = [
  // ADMIN
  {
    name: "Tổng quan hệ thống",
    path: "/dashboard",
    icon: LayoutDashboard,
    roles: [ROLES.ADMIN],
  },
  {
    name: "Giám sát hoạt động",
    path: "/admin/monitoring",
    icon: BarChart3,
    roles: [ROLES.ADMIN],
  },
  {
    name: "Nhân viên & phân công",
    path: "/employees",
    icon: UserCog,
    roles: [ROLES.ADMIN],
  },
  {
    name: "Quản lý kho",
    path: "/warehouses",
    icon: Warehouse,
    roles: [ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER],
  },
  {
    name: "Báo cáo & thống kê",
    path: "/reports",
    icon: BarChart3,
    roles: [ROLES.ADMIN],
  },
  {
    name: "Nhà cung cấp",
    path: "/suppliers",
    icon: Truck,
    roles: [ROLES.ADMIN],
  },

  // BRANCH MANAGER
  {
    name: "Tổng quan chi nhánh",
    path: "/branch-dashboard",
    icon: LayoutDashboard,
    roles: [ROLES.BRANCH_MANAGER],
  },

  // WAREHOUSE MANAGER
  {
    name: "Tổng quan kho",
    path: "/warehouse-dashboard",
    icon: LayoutDashboard,
    roles: [ROLES.WAREHOUSE_MANAGER],
  },

  // SALES STAFF
  {
    name: "Tổng quan bán hàng",
    path: "/sales-dashboard",
    icon: ShoppingCart,
    roles: [ROLES.SALES_STAFF],
  },

  // CÁC TRANG VẬN HÀNH
  {
    name: "Sản phẩm",
    path: "/products",
    icon: Package,
    roles: [
      ROLES.BRANCH_MANAGER,
      ROLES.WAREHOUSE_MANAGER,
      ROLES.SALES_STAFF,
    ],
  },
  {
    name: "Tồn kho",
    path: "/inventory",
    icon: Boxes,
    roles: [
      ROLES.BRANCH_MANAGER,
      ROLES.WAREHOUSE_MANAGER,
    ],
  },
  {
    name: "Khách hàng",
    path: "/customers",
    icon: Users,
    roles: [
      ROLES.BRANCH_MANAGER,
      ROLES.SALES_STAFF,
    ],
  },
  {
    name: "Bán hàng",
    path: "/sales",
    icon: ShoppingCart,
    roles: [ROLES.SALES_STAFF],
  },
  {
    name: "Hóa đơn",
    path: "/invoices",
    icon: Receipt,
    roles: [
      ROLES.BRANCH_MANAGER,
      ROLES.SALES_STAFF,
    ],
  },

  // TẤT CẢ VAI TRÒ
  {
    name: "Hồ sơ cá nhân",
    path: "/profile",
    icon: User,
    roles: [
      ROLES.ADMIN,
      ROLES.BRANCH_MANAGER,
      ROLES.WAREHOUSE_MANAGER,
      ROLES.SALES_STAFF,
    ],
  },
];

export default function MainLayout() {
  const navigate = useNavigate();
  const userRoles = getRoles();

  const visibleMenus = menus.filter((menu) =>
    menu.roles.some((role) => userRoles.includes(role))
  );

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-64 shrink-0 flex-col bg-slate-900 text-white">
        <div className="border-b border-slate-700 p-6">
          <h1 className="text-2xl font-bold">Mini ERP</h1>
          <p className="mt-1 text-xs text-slate-400">
            Retail Management
          </p>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {visibleMenus.map((menu) => {
            const Icon = menu.icon;

            return (
              <NavLink
                key={menu.path}
                to={menu.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800"
                  }`
                }
              >
                <Icon size={19} />
                {menu.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-slate-700 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-slate-300 hover:bg-slate-800"
          >
            <LogOut size={19} />
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-white px-8">
          <h2 className="font-semibold text-slate-800">
            Hệ thống quản lý bán lẻ
          </h2>

          <span className="text-sm text-slate-500">
            Mini ERP
          </span>
        </header>

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
