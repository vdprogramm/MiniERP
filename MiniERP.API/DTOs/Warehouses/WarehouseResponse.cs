using MiniERP.API.Entities;

namespace MiniERP.API.DTOs.Warehouses;

public record WarehouseResponse(
    int Id,
    string Name,
    string Location,
    int? ManagerId,
    string? ManagerName
)
{
    public static WarehouseResponse From(Warehouse warehouse)
        => new(
            warehouse.Id,
            warehouse.Name,
            warehouse.Location,
            warehouse.ManagerId,
            warehouse.Manager?.Name
        );
}
