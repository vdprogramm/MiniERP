using System.ComponentModel.DataAnnotations;

namespace MiniERP.API.DTOs.Inventory;

public class AdjustInventoryRequest
{
    [Range(1, int.MaxValue)]
    public int WarehouseId { get; set; }

    [Range(1, int.MaxValue)]
    public int ProductId { get; set; }

    // Số dương: tăng tồn kho
    // Số âm: giảm tồn kho
    [Range(int.MinValue, int.MaxValue)]
    public int QuantityChange { get; set; }
}
