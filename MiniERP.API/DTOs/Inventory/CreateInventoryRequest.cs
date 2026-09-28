using System.ComponentModel.DataAnnotations;

namespace MiniERP.API.DTOs.Inventory;

public class CreateInventoryRequest
{
    [Range(1, int.MaxValue)]
    public int WarehouseId { get; set; }

    [Range(1, int.MaxValue)]
    public int ProductId { get; set; }

    [Range(0, int.MaxValue)]
    public int Quantity { get; set; }
}
