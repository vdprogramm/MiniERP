using Microsoft.EntityFrameworkCore;
using MiniERP.API.Constants;
using MiniERP.API.Data;
using MiniERP.API.DTOs.Warehouses;
using MiniERP.API.Entities;

namespace MiniERP.API.Services;

public class WarehouseService : IWarehouseService
{
    private readonly AppDbContext _db;

    public WarehouseService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<WarehouseResponse>> GetAllAsync(
        IEnumerable<int>? warehouseIds,
        bool isAdmin)
    {
        var query = _db.Warehouses
            .Include(w => w.Manager)
            .AsNoTracking()
            .AsQueryable();

        if (!isAdmin)
        {
            if (warehouseIds == null || !warehouseIds.Any())
                return new List<WarehouseResponse>();

            var ids = warehouseIds.ToList();
            query = query.Where(w => ids.Contains(w.Id));
        }

        var warehouses = await query
            .OrderBy(w => w.Id)
            .ToListAsync();

        return warehouses
            .Select(WarehouseResponse.From)
            .ToList();
    }

    public async Task<WarehouseResponse?> GetByIdAsync(int id)
    {
        var warehouse = await _db.Warehouses
            .Include(w => w.Manager)
            .AsNoTracking()
            .FirstOrDefaultAsync(w => w.Id == id);

        return warehouse == null
            ? null
            : WarehouseResponse.From(warehouse);
    }

    public async Task<WarehouseResponse> CreateAsync(
        CreateWarehouseRequest request)
    {
        if (request.ManagerId.HasValue)
        {
            throw new ArgumentException(
                "Với kho mới, vui lòng tạo kho trước, sau đó gán nhân viên và cập nhật người quản lý sau.");
        }

        var warehouse = new Warehouse
        {
            Name = request.Name.Trim(),
            Location = request.Location.Trim(),
            ManagerId = request.ManagerId
        };

        _db.Warehouses.Add(warehouse);

        await _db.SaveChangesAsync();

        await _db.Entry(warehouse)
            .Reference(w => w.Manager)
            .LoadAsync();

        return WarehouseResponse.From(warehouse);
    }

    public async Task<WarehouseResponse?> UpdateAsync(
        int id,
        UpdateWarehouseRequest request)
    {
        var warehouse = await _db.Warehouses
            .FindAsync(id);

        if (warehouse == null)
            return null;

        if (request.ManagerId.HasValue)
        {
            await ValidateManagerAsync(
                request.ManagerId.Value, id);
        }

        warehouse.Name = request.Name.Trim();
        warehouse.Location = request.Location.Trim();
        warehouse.ManagerId = request.ManagerId;

        await _db.SaveChangesAsync();

        await _db.Entry(warehouse)
            .Reference(w => w.Manager)
            .LoadAsync();

        return WarehouseResponse.From(warehouse);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var warehouse = await _db.Warehouses
            .FindAsync(id);

        if (warehouse == null)
            return false;

        var hasEmployees = await _db.EmployeeWarehouses
            .AnyAsync(e => e.WarehouseId == id);

        var hasInventory = await _db.InventoryStocks
            .AnyAsync(i => i.WarehouseId == id);

        var hasInvoices = await _db.Invoices
            .AnyAsync(i => i.WarehouseId == id);

        if (hasEmployees || hasInventory || hasInvoices)
        {
            throw new InvalidOperationException(
                "Không thể xóa kho đã có nhân viên, tồn kho hoặc hóa đơn");
        }

        _db.Warehouses.Remove(warehouse);

        await _db.SaveChangesAsync();

        return true;
    }

    private async Task ValidateManagerAsync(int managerId, int warehouseId)
    {
        var manager = await _db.Employees
            .Include(e => e.EmployeeWarehouses)
            .FirstOrDefaultAsync(e => e.Id == managerId);

        if (manager == null)
            throw new ArgumentException(
                "Nhân viên không tồn tại");

        if (manager.Position != Roles.WarehouseManager &&
            manager.Position != Roles.BranchManager)
        {
            throw new ArgumentException(
                "Nhân viên không có quyền quản lý kho hoặc chi nhánh");
        }

        if (!manager.EmployeeWarehouses.Any(ew => ew.WarehouseId == warehouseId))
        {
            throw new ArgumentException(
                "Người quản lý phải là nhân viên thuộc kho này");
        }
    }
}
