import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import WarehouseDashboardPage from "./pages/WarehouseDashboardPage";
import ProductsPage from "./pages/ProductsPage";
import WarehousesPage from "./pages/WarehousesPage";
import InventoryPage from "./pages/InventoryPage";
import CustomersPage from "./pages/CustomersPage";
import SuppliersPage from "./pages/SuppliersPage";
import SalesPage from "./pages/SalesPage";
import InvoicesPage from "./pages/InvoicesPage";
import ReportsPage from "./pages/ReportsPage";
import EmployeesPage from "./pages/EmployeesPage";
import SalesDashboardPage from "./pages/SalesDashboardPage";
import BranchDashboardPage from "./pages/BranchDashboardPage";
import ProfilePage from "./pages/ProfilePage";
import AdminMonitoringPage from "./pages/AdminMonitoringPage";

import { getRoles, ROLES } from "./utils/auth";

import LandingPage from "./pages/LandingPage";

function HomeRedirect() {
  const roles = getRoles();

  if (roles.includes(ROLES.ADMIN)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (roles.includes(ROLES.BRANCH_MANAGER)) {
    return <Navigate to="/branch-dashboard" replace />;
  }

  if (roles.includes(ROLES.WAREHOUSE_MANAGER)) {
    return <Navigate to="/warehouse-dashboard" replace />;
  }

  if (roles.includes(ROLES.SALES_STAFF)) {
    return <Navigate to="/sales-dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
}

const warehouseRoles = [
  ROLES.ADMIN,
  ROLES.WAREHOUSE_MANAGER,
];

const inventoryRoles = [
  ROLES.ADMIN,
  ROLES.BRANCH_MANAGER,
  ROLES.WAREHOUSE_MANAGER,
];

const salesRoles = [
  ROLES.ADMIN,
  ROLES.BRANCH_MANAGER,
  ROLES.SALES_STAFF,
];

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route
              path="/app"
              element={<HomeRedirect />}
            />

            <Route
              path="/profile"
              element={<ProfilePage />}
            />

            <Route
              element={
                <ProtectedRoute roles={warehouseRoles} />
              }
            >
              <Route
                path="/warehouse-dashboard"
                element={<WarehouseDashboardPage />}
              />
            </Route>

            <Route
              element={
                <ProtectedRoute roles={inventoryRoles} />
              }
            >
              <Route
                path="/warehouses"
                element={<WarehousesPage />}
              />

              <Route
                path="/inventory"
                element={<InventoryPage />}
              />
            </Route>

            <Route
              path="/products"
              element={<ProductsPage />}
            />

            <Route
              element={
                <ProtectedRoute roles={salesRoles} />
              }
            >
              <Route
                path="/customers"
                element={<CustomersPage />}
              />

              <Route
                path="/sales"
                element={<SalesPage />}
              />

              <Route
                path="/invoices"
                element={<InvoicesPage />}
              />
            </Route>

            <Route
              element={
                <ProtectedRoute roles={[ROLES.ADMIN, ROLES.SALES_STAFF]} />
              }
            >
              <Route
                path="/sales-dashboard"
                element={<SalesDashboardPage />}
              />
            </Route>

            <Route
              element={
                <ProtectedRoute roles={[ROLES.BRANCH_MANAGER]} />
              }
            >
              <Route
                path="/branch-dashboard"
                element={<BranchDashboardPage />}
              />
            </Route>

            <Route
              element={
                <ProtectedRoute roles={[ROLES.ADMIN]} />
              }
            >
              <Route
                path="/dashboard"
                element={<DashboardPage />}
              />
              <Route
                path="/admin/monitoring"
                element={<AdminMonitoringPage />}
              />
              <Route
                path="/reports"
                element={<ReportsPage />}
              />
              <Route
                path="/employees"
                element={<EmployeesPage />}
              />
              <Route
                path="/suppliers"
                element={<SuppliersPage />}
              />
            </Route>
          </Route>
        </Route>

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
