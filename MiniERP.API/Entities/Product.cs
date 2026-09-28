namespace MiniERP.API.Entities;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string SKU { get; set; } = "";
    public string Category { get; set; } = "";

    public decimal CostPrice { get; set; }
    public decimal SalePrice { get; set; }

    public string Description { get; set; } = "";

    public ICollection<InventoryStock> InventoryStocks { get; set; }
        = new List<InventoryStock>();

    public ICollection<InvoiceDetail> InvoiceDetails { get; set; }
        = new List<InvoiceDetail>();
}
