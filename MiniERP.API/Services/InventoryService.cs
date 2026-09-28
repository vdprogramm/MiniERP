using Microsoft.EntityFrameworkCore;
using MiniERP.API.Data;
using MiniERP.API.DTOs.Inventory;
using MiniERP.API.Entities;

namespace MiniERP.API.Services;

public class InventoryService : IInventoryService
{
    private readonly AppDbContext _db;

    public InventoryService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<InventoryResponse>> GetAllAsync(
        IEnumerable<int>? warehouseIds = null)
    {
        var query = _db.InventoryStocks
            .AsNoTracking()
            .AsQueryable();

        if (warehouseIds != null && warehouseIds.Any())
        {
            query = query.Where(
                x => warehouseIds.Contains(x.WarehouseId));
        }

        return await query
            .OrderBy(x => x.WarehouseId)
            .ThenBy(x => x.ProductId)
            .Select(x => new InventoryResponse(
                x.Id,
                x.WarehouseId,
                x.Warehouse.Name,
                x.ProductId,
                x.Product.Name,
                x.Product.SKU,
                x.Quantity
            ))
            .ToListAsync();
    }

    public async Task<List<InventoryResponse>> GetLowStockAsync(
        int threshold,
        IEnumerable<int>? warehouseIds = null)
    {
        var query = _db.InventoryStocks
            .AsNoTracking()
            .Where(x => x.Quantity <= threshold);

        if (warehouseIds != null && warehouseIds.Any())
        {
            query = query.Where(
                x => warehouseIds.Contains(x.WarehouseId));
        }

        return await query
            .OrderBy(x => x.Quantity)
            .Select(x => new InventoryResponse(
                x.Id,
                x.WarehouseId,
                x.Warehouse.Name,
                x.ProductId,
                x.Product.Name,
                x.Product.SKU,
                x.Quantity
            ))
            .ToListAsync();
    }

    public async Task<InventoryResponse> CreateAsync(
        CreateInventoryRequest request)
    {
        var warehouse = await _db.Warehouses
            .FindAsync(request.WarehouseId);

        if (warehouse == null)
            throw new ArgumentException(
                "Kho không tồn tại");

        var product = await _db.Products
            .FindAsync(request.ProductId);

        if (product == null)
            throw new ArgumentException(
                "Sản phẩm không tồn tại");

        var exists = await _db.InventoryStocks.AnyAsync(
            x => x.WarehouseId == request.WarehouseId &&
                 x.ProductId == request.ProductId);

        if (exists)
            throw new InvalidOperationException(
                "Sản phẩm đã tồn tại trong kho");

        var inventory = new InventoryStock
        {
            WarehouseId = request.WarehouseId,
            ProductId = request.ProductId,
            Quantity = request.Quantity
        };

        _db.InventoryStocks.Add(inventory);

        await _db.SaveChangesAsync();

        return new InventoryResponse(
            inventory.Id,
            warehouse.Id,
            warehouse.Name,
            product.Id,
            product.Name,
            product.SKU,
            inventory.Quantity
        );
    }

    public async Task<InventoryResponse> AdjustAsync(
        AdjustInventoryRequest request)
    {
        var inventory = await _db.InventoryStocks
            .Include(x => x.Warehouse)
            .Include(x => x.Product)
            .FirstOrDefaultAsync(x =>
                x.WarehouseId == request.WarehouseId &&
                x.ProductId == request.ProductId);

        if (inventory == null)
            throw new KeyNotFoundException(
                "Không tìm thấy tồn kho");

        // UPDATE có điều kiện, thực hiện trực tiếp tại PostgreSQL.
        // Tránh lost update khi nhiều request cùng điều chỉnh.
        var updated = await _db.InventoryStocks
            .Where(x =>
                x.Id == inventory.Id &&
                (long)x.Quantity + request.QuantityChange >= 0 &&
                (long)x.Quantity + request.QuantityChange <= int.MaxValue)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(
                    x => x.Quantity,
                    x => x.Quantity + request.QuantityChange));

        if (updated == 0)
            throw new InvalidOperationException(
                "Điều chỉnh không hợp lệ hoặc tồn kho không đủ");

        // ExecuteUpdateAsync bỏ qua Change Tracker.
        await _db.Entry(inventory).ReloadAsync();

        return new InventoryResponse(
            inventory.Id,
            inventory.WarehouseId,
            inventory.Warehouse.Name,
            inventory.ProductId,
            inventory.Product.Name,
            inventory.Product.SKU,
            inventory.Quantity
        );
    }
}
