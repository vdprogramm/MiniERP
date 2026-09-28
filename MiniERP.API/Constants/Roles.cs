namespace MiniERP.API.Constants;

public static class Roles
{
    public const string Admin = "ADMIN";

    public const string WarehouseManager =
        "WAREHOUSE_MANAGER";

    public const string SalesStaff = "SALES_STAFF";

    public const string BranchManager =
        "BRANCH_MANAGER";

    public static readonly string[] All =
    {
        Admin,
        WarehouseManager,
        SalesStaff,
        BranchManager
    };
}
