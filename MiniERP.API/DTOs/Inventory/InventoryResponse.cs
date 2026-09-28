namespace MiniERP.API.DTOs.Inventory;

public record InventoryResponse(
    int Id,
    int WarehouseId,
    string WarehouseName,
    int ProductId,
    string ProductName,
    string SKU,
    int Quantity
);
