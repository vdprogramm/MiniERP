using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniERP.API.Constants;
using MiniERP.API.Data;
using MiniERP.API.Services;

namespace MiniERP.API.Controllers;

[ApiController]
[Route("api/branch-dashboard")]
[Authorize(Roles = Roles.BranchManager)]
public class BranchDashboardController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IReportService _reportService;

    public BranchDashboardController(
        AppDbContext db,
        IReportService reportService)
    {
        _db = db;
        _reportService = reportService;
    }

    [HttpGet]
    public async Task<IActionResult> GetDashboard()
    {
        // 1. Xác định nhân viên đang đăng nhập
        var employeeIdValue = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (!int.TryParse(employeeIdValue, out var employeeId))
        {
            return Unauthorized();
        }

        // 2. Lấy chi nhánh được phân công từ database
        var employee = await _db.Employees
            .Include(e => e.EmployeeWarehouses)
            .AsNoTracking()
            .Where(e => e.Id == employeeId)
            .FirstOrDefaultAsync();

        if (employee == null)
        {
            return Unauthorized();
        }

        var warehouseIds = employee.EmployeeWarehouses.Select(ew => ew.WarehouseId).ToList();

        if (!warehouseIds.Any())
        {
            return StatusCode(403, new
            {
                message = "Tài khoản chưa được phân công chi nhánh."
            });
        }

        // 3. Kiểm tra chi nhánh tồn tại
        var warehouses = await _db.Warehouses
            .AsNoTracking()
            .Where(w => warehouseIds.Contains(w.Id))
            .Select(w => new
            {
                w.Id,
                w.Name
            })
            .ToListAsync();

        if (!warehouses.Any())
        {
            return NotFound(new
            {
                message = "Chi nhánh được phân công không tồn tại."
            });
        }

        // 4. Tái sử dụng thống kê từ ReportService
        var summary = await _reportService
            .GetDashboardAsync(warehouseIds);

        // 5. Đếm nhân viên thuộc chi nhánh
        var employeeCount = await _db.EmployeeWarehouses
            .AsNoTracking()
            .Where(e => warehouseIds.Contains(e.WarehouseId))
            .Select(e => e.EmployeeId)
            .Distinct()
            .CountAsync();

        // 6. Tổng số lượng hàng đang tồn
        var totalStock = await _db.InventoryStocks
            .AsNoTracking()
            .Where(s => warehouseIds.Contains(s.WarehouseId))
            .SumAsync(s => (long?)s.Quantity) ?? 0L;

        // 7. Doanh thu trong ngày UTC
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        var todayRevenue = await _db.Invoices
            .AsNoTracking()
            .Where(i =>
                warehouseIds.Contains(i.WarehouseId) &&
                i.CreatedAt >= today &&
                i.CreatedAt < tomorrow)
            .SumAsync(i => (decimal?)i.TotalAmount) ?? 0m;

        // 8. Năm hóa đơn mới nhất
        var recentInvoices = await _db.Invoices
            .AsNoTracking()
            .Where(i => warehouseIds.Contains(i.WarehouseId))
            .OrderByDescending(i => i.CreatedAt)
            .ThenByDescending(i => i.Id)
            .Take(5)
            .Select(i => new
            {
                i.Id,
                i.TotalAmount,
                i.CreatedAt
            })
            .ToListAsync();

        return Ok(new
        {
            warehouses,

            employeeCount,

            productCount = summary.TotalProducts,
            totalStock,
            lowStockCount = summary.LowStockCount,

            invoiceCount = summary.TotalInvoices,
            totalRevenue = summary.TotalRevenue,
            todayRevenue,

            recentInvoices
        });
    }
}