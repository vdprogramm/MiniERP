using System.Data;
using Microsoft.EntityFrameworkCore;
using MiniERP.API.Constants;
using MiniERP.API.Data;
using MiniERP.API.DTOs.Invoices;
using MiniERP.API.Entities;

namespace MiniERP.API.Services;

public class InvoiceService : IInvoiceService
{
    private readonly AppDbContext _db;

    public InvoiceService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<InvoiceResponse> CreateAsync(
        int employeeId,
        CreateInvoiceRequest request)
    {
        if (request.Items == null || request.Items.Count == 0)
            throw new ArgumentException(
                "Hóa đơn phải có ít nhất một sản phẩm");

        if (request.Items.Any(x => x.ProductId <= 0 || x.Quantity <= 0))
            throw new ArgumentException(
                "Sản phẩm và số lượng phải lớn hơn 0");

        if (request.Items
            .GroupBy(x => x.ProductId)
            .Any(g => g.Count() > 1))
        {
            throw new ArgumentException(
                "Một sản phẩm không được xuất hiện nhiều lần");
        }

        // Khóa giao dịch ở mức Serializable để đảm bảo
        // việc kiểm tra và cập nhật được thực hiện nhất quán.
        await using var transaction =
            await _db.Database.BeginTransactionAsync(
                IsolationLevel.Serializable);

        var employee = await _db.Employees
            .Include(e => e.EmployeeWarehouses)
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == employeeId);

        if (employee == null)
            throw new ArgumentException(
                "Nhân viên không tồn tại");

        // Admin có thể bán tại mọi kho.
        // Nhân viên khác chỉ được bán tại chi nhánh của mình.
        var isAdmin = employee.Position == Roles.Admin;

        if (!isAdmin &&
            !employee.EmployeeWarehouses.Any(ew => ew.WarehouseId == request.WarehouseId))
        {
            throw new UnauthorizedAccessException(
                "Không được tạo hóa đơn tại chi nhánh khác");
        }

        var warehouseExists = await _db.Warehouses
            .AnyAsync(x => x.Id == request.WarehouseId);

        if (!warehouseExists)
            throw new ArgumentException(
                "Kho không tồn tại");

        if (request.CustomerId.HasValue)
        {
            var customerExists = await _db.Customers
                .AnyAsync(x => x.Id == request.CustomerId.Value);

            if (!customerExists)
                throw new ArgumentException(
                    "Khách hàng không tồn tại");
        }

        var productIds = request.Items
            .Select(x => x.ProductId)
            .ToList();

        var products = await _db.Products
            .AsNoTracking()
            .Where(x => productIds.Contains(x.Id))
            .ToDictionaryAsync(x => x.Id);

        if (products.Count != productIds.Count)
            throw new ArgumentException(
                "Có sản phẩm không tồn tại");

        // Lấy và khóa logic các dòng tồn kho thông qua
        // transaction Serializable và UPDATE có điều kiện.
        var stocks = await _db.InventoryStocks
            .AsNoTracking()
            .Where(x =>
                x.WarehouseId == request.WarehouseId &&
                productIds.Contains(x.ProductId))
            .ToDictionaryAsync(x => x.ProductId);

        if (stocks.Count != productIds.Count)
            throw new InvalidOperationException(
                "Có sản phẩm chưa được nhập vào kho");

        foreach (var item in request.Items)
        {
            if (stocks[item.ProductId].Quantity < item.Quantity)
            {
                throw new InvalidOperationException(
                    $"Sản phẩm {products[item.ProductId].Name} không đủ tồn kho");
            }
        }

        // Sắp xếp theo ProductId để giảm nguy cơ deadlock
        // khi nhiều hóa đơn cùng chứa các sản phẩm.
        foreach (var item in request.Items.OrderBy(x => x.ProductId))
        {
            var updated = await _db.InventoryStocks
                .Where(x =>
                    x.WarehouseId == request.WarehouseId &&
                    x.ProductId == item.ProductId &&
                    x.Quantity >= item.Quantity)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(
                        x => x.Quantity,
                        x => x.Quantity - item.Quantity));

            if (updated != 1)
            {
                throw new InvalidOperationException(
                    $"Không đủ tồn kho cho sản phẩm {products[item.ProductId].Name}");
            }
        }

        decimal totalAmount = 0;

        var invoiceDetails = new List<InvoiceDetail>();

        foreach (var item in request.Items)
        {
            var product = products[item.ProductId];

            var subtotal = checked(
                product.SalePrice * item.Quantity);

            totalAmount = checked(totalAmount + subtotal);

            invoiceDetails.Add(new InvoiceDetail
            {
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                UnitPrice = product.SalePrice
            });
        }

        var invoice = new Invoice
        {
            WarehouseId = request.WarehouseId,
            EmployeeId = employeeId,
            CustomerId = request.CustomerId,
            TotalAmount = totalAmount,
            CreatedAt = DateTime.UtcNow,
            InvoiceDetails = invoiceDetails
        };

        _db.Invoices.Add(invoice);

        await _db.SaveChangesAsync();

        await transaction.CommitAsync();

        return new InvoiceResponse(
            invoice.Id,
            invoice.WarehouseId,
            invoice.EmployeeId,
            invoice.CustomerId,
            invoice.TotalAmount,
            invoice.CreatedAt,
            invoiceDetails.Select(x =>
                new InvoiceDetailResponse(
                    x.ProductId,
                    products[x.ProductId].Name,
                    x.Quantity,
                    x.UnitPrice,
                    x.UnitPrice * x.Quantity
                )).ToList()
        );
    }

    public async Task<InvoiceResponse?> GetByIdAsync(int id)
    {
        return await _db.Invoices
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new InvoiceResponse(
                x.Id,
                x.WarehouseId,
                x.EmployeeId,
                x.CustomerId,
                x.TotalAmount,
                x.CreatedAt,
                x.InvoiceDetails.Select(d =>
                    new InvoiceDetailResponse(
                        d.ProductId,
                        d.Product.Name,
                        d.Quantity,
                        d.UnitPrice,
                        d.UnitPrice * d.Quantity
                    )).ToList()
            ))
            .FirstOrDefaultAsync();
    }

    public async Task<List<InvoiceResponse>> GetAllAsync(
        IEnumerable<int>? warehouseIds)
    {
        var query = _db.Invoices
            .AsNoTracking()
            .AsQueryable();

        // null chỉ dành cho trường hợp controller đã xác thực ADMIN.
        if (warehouseIds != null)
        {
            var ids = warehouseIds.Distinct().ToArray();

            if (ids.Length == 0)
                return new List<InvoiceResponse>();

            query = query.Where(x =>
                ids.Contains(x.WarehouseId));
        }

        return await query
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new InvoiceResponse(
                x.Id,
                x.WarehouseId,
                x.EmployeeId,
                x.CustomerId,
                x.TotalAmount,
                x.CreatedAt,
                x.InvoiceDetails.Select(d =>
                    new InvoiceDetailResponse(
                        d.ProductId,
                        d.Product.Name,
                        d.Quantity,
                        d.UnitPrice,
                        d.UnitPrice * d.Quantity
                    )).ToList()
            ))
            .ToListAsync();
    }
}
