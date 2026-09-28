using MiniERP.API.DTOs.Warehouses;

namespace MiniERP.API.Services;

public interface IWarehouseService
{
    Task<List<WarehouseResponse>> GetAllAsync(
        IEnumerable<int>? warehouseIds,
        bool isAdmin);

    Task<WarehouseResponse?> GetByIdAsync(int id);

    Task<WarehouseResponse> CreateAsync(
        CreateWarehouseRequest request);

    Task<WarehouseResponse?> UpdateAsync(
        int id,
        UpdateWarehouseRequest request);

    Task<bool> DeleteAsync(int id);
}
