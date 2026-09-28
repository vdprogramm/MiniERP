export function getHomeRoute(role: string): string {
  switch (role.toUpperCase()) {
    case "ADMIN":
      return "/dashboard";

    case "WAREHOUSE_MANAGER":
      return "/warehouse-dashboard";

    case "SALES_STAFF":
      return "/sales-dashboard";

    case "BRANCH_MANAGER":
      return "/dashboard";

    default:
      return "/login";
  }
}
