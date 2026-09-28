using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MiniERP.API.Migrations
{
    /// <inheritdoc />
    public partial class AddEmployeeWarehouses : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Tạo bảng liên kết trước, chưa xóa BranchId
            migrationBuilder.CreateTable(
                name: "EmployeeWarehouses",
                columns: table => new
                {
                    EmployeeId = table.Column<int>(
                        type: "integer",
                        nullable: false),

                    WarehouseId = table.Column<int>(
                        type: "integer",
                        nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey(
                        "PK_EmployeeWarehouses",
                        x => new { x.EmployeeId, x.WarehouseId });

                    table.ForeignKey(
                        name: "FK_EmployeeWarehouses_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);

                    table.ForeignKey(
                        name: "FK_EmployeeWarehouses_Warehouses_WarehouseId",
                        column: x => x.WarehouseId,
                        principalTable: "Warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeWarehouses_WarehouseId",
                table: "EmployeeWarehouses",
                column: "WarehouseId");

            // 2. Chuyển dữ liệu phân công cũ sang bảng mới
            migrationBuilder.Sql("""
                INSERT INTO "EmployeeWarehouses"
                    ("EmployeeId", "WarehouseId")
                SELECT "Id", "BranchId"
                FROM "Employees"
                WHERE "BranchId" IS NOT NULL
                ON CONFLICT ("EmployeeId", "WarehouseId")
                DO NOTHING;
                """);

            // 3. Xóa khóa ngoại và index cũ
            migrationBuilder.DropForeignKey(
                name: "FK_Employees_Warehouses_BranchId",
                table: "Employees");

            migrationBuilder.DropIndex(
                name: "IX_Employees_BranchId",
                table: "Employees");

            // 4. Chỉ xóa BranchId sau khi đã chuyển dữ liệu
            migrationBuilder.DropColumn(
                name: "BranchId",
                table: "Employees");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // 1. Tạo lại cột cũ
            migrationBuilder.AddColumn<int>(
                name: "BranchId",
                table: "Employees",
                type: "integer",
                nullable: true);

            // 2. Khôi phục một kho đại diện cho mỗi nhân viên
            migrationBuilder.Sql("""
                UPDATE "Employees" e
                SET "BranchId" = (
                    SELECT MIN(ew."WarehouseId")
                    FROM "EmployeeWarehouses" ew
                    WHERE ew."EmployeeId" = e."Id"
                );
                """);

            // 3. Khôi phục index và khóa ngoại
            migrationBuilder.CreateIndex(
                name: "IX_Employees_BranchId",
                table: "Employees",
                column: "BranchId");

            migrationBuilder.AddForeignKey(
                name: "FK_Employees_Warehouses_BranchId",
                table: "Employees",
                column: "BranchId",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            // 4. Xóa bảng liên kết sau cùng
            migrationBuilder.DropTable(
                name: "EmployeeWarehouses");
        }
    }
}
