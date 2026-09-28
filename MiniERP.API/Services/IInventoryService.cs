using MiniERP.API.DTOs.Inventory;

namespace MiniERP.API.Services;

public interface IInventoryService
{
    Task<List<InventoryResponse>> GetAllAsync(
        IEnumerable<int>? warehouseIds = null);

    Task<List<InventoryResponse>> GetLowStockAsync(
        int threshold,
        IEnumerable<int>? warehouseIds = null);

    Task<InventoryResponse> CreateAsync(
        CreateInventoryRequest request);

    Task<InventoryResponse> AdjustAsync(
        AdjustInventoryRequest request);
}
