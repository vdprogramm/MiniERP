using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniERP.API.Constants;
using MiniERP.API.Data;

namespace MiniERP.API.Controllers;

[ApiController]
[Route("api/admin/monitoring")]
[Authorize(Roles = Roles.Admin)]
public class AdminMonitoringController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminMonitoringController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("warehouses")]
    public async Task<IActionResult> GetWarehouses()
    {
        var warehouses = await _db.Warehouses
            .AsNoTracking()
            .Select(w => new
            {
                w.Id,
                w.Name
            })
            .OrderBy(w => w.Id)
            .ToListAsync();

        var stockStats = await _db.InventoryStocks
            .AsNoTracking()
            .GroupBy(s => s.WarehouseId)
            .Select(g => new
            {
                WarehouseId = g.Key,
                StockLines = g.Count(),
                TotalQuantity = g.Sum(s => s.Quantity),
                LowStockLines = g.Count(s => s.Quantity <= 5)
            })
            .ToDictionaryAsync(x => x.WarehouseId);

        var invoiceStats = await _db.Invoices
            .AsNoTracking()
            .GroupBy(i => i.WarehouseId)
            .Select(g => new
            {
                WarehouseId = g.Key,
                InvoiceCount = g.Count(),
                Revenue = g.Sum(i => i.TotalAmount)
            })
            .ToDictionaryAsync(x => x.WarehouseId);

        var employeeStats = await _db.EmployeeWarehouses
            .AsNoTracking()
            .GroupBy(ew => ew.WarehouseId)
            .Select(g => new
            {
                WarehouseId = g.Key,
                EmployeeCount = g.Count()
            })
            .ToDictionaryAsync(x => x.WarehouseId);

        var result = warehouses.Select(w =>
        {
            stockStats.TryGetValue(w.Id, out var stock);
            invoiceStats.TryGetValue(w.Id, out var invoice);
            employeeStats.TryGetValue(w.Id, out var employee);

            return new
            {
                warehouseId = w.Id,
                warehouseName = w.Name,
                employeeCount = employee?.EmployeeCount ?? 0,
                stockLines = stock?.StockLines ?? 0,
                totalQuantity = stock?.TotalQuantity ?? 0,
                lowStockLines = stock?.LowStockLines ?? 0,
                invoiceCount = invoice?.InvoiceCount ?? 0,
                revenue = invoice?.Revenue ?? 0m
            };
        }).ToList();

        return Ok(result);
    }
}
