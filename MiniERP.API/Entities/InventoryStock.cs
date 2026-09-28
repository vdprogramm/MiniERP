namespace MiniERP.API.Entities;

public class InventoryStock
{
    public int Id { get; set; }

    public int WarehouseId { get; set; }
    public int ProductId { get; set; }

    public int Quantity { get; set; }

    public Warehouse Warehouse { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
