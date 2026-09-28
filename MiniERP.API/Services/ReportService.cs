using Microsoft.EntityFrameworkCore;
using MiniERP.API.Data;
using MiniERP.API.DTOs.Reports;

namespace MiniERP.API.Services;

public class ReportService : IReportService
{
    private readonly AppDbContext _db;

    public ReportService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<DashboardResponse> GetDashboardAsync(
        IEnumerable<int>? warehouseIds)
    {
        var invoices = _db.Invoices.AsNoTracking().AsQueryable();
        var stocks = _db.InventoryStocks.AsNoTracking().AsQueryable();

        int[]? ids = warehouseIds?.Distinct().ToArray();

        if (ids != null)
        {
            invoices = invoices.Where(x => ids.Contains(x.WarehouseId));
            stocks = stocks.Where(x => ids.Contains(x.WarehouseId));
        }

        var revenue = await invoices
            .SumAsync(x => (decimal?)x.TotalAmount) ?? 0m;

        var invoiceCount = await invoices.CountAsync();

        var productCount = ids != null
            ? await stocks.Select(x => x.ProductId).Distinct().CountAsync()
            : await _db.Products.CountAsync();

        var customerCount = ids != null
            ? await invoices
                .Where(x => x.CustomerId.HasValue)
                .Select(x => x.CustomerId)
                .Distinct()
                .CountAsync()
            : await _db.Customers.CountAsync();

        var lowStockCount = await stocks
            .CountAsync(x => x.Quantity <= 5);

        return new DashboardResponse(
            revenue,
            invoiceCount,
            productCount,
            customerCount,
            lowStockCount
        );
    }

    public async Task<List<RevenueByDayResponse>>
        GetRevenueAsync(
            DateTime from,
            DateTime to,
            IEnumerable<int>? warehouseIds)
    {
        var query = _db.Invoices
            .AsNoTracking()
            .Where(x =>
                x.CreatedAt >= from &&
                x.CreatedAt < to);

        if (warehouseIds != null)
        {
            var ids = warehouseIds.Distinct().ToArray();

            query = query.Where(x => ids.Contains(x.WarehouseId));
        }

        var rawData = await query
            .Select(x => new { x.CreatedAt, x.TotalAmount })
            .ToListAsync();

        return rawData
            .GroupBy(x => x.CreatedAt.Date)
            .Select(g => new RevenueByDayResponse(
                g.Key,
                g.Sum(x => x.TotalAmount),
                g.Count()
            ))
            .OrderBy(x => x.Date)
            .ToList();
    }

    public async Task<List<TopProductResponse>>
        GetTopProductsAsync(
            IEnumerable<int>? warehouseIds,
            int limit)
    {
        var details = _db.InvoiceDetails
            .AsNoTracking()
            .AsQueryable();

        if (warehouseIds != null)
        {
            var ids = warehouseIds.Distinct().ToArray();

            details = details.Where(
                x => ids.Contains(x.Invoice.WarehouseId));
        }

        var result = await details
            .GroupBy(x => new
            {
                x.ProductId,
                x.Product.Name
            })
            .Select(g => new
            {
                ProductId = g.Key.ProductId,
                ProductName = g.Key.Name,
                QuantitySold = g.Sum(x => x.Quantity),
                Revenue = g.Sum(x => x.UnitPrice * x.Quantity)
            })
            .OrderByDescending(x => x.QuantitySold)
            .Take(limit)
            .ToListAsync();

        return result
            .Select(x => new TopProductResponse(
                x.ProductId,
                x.ProductName,
                x.QuantitySold,
                x.Revenue
            ))
            .ToList();
    }
}
