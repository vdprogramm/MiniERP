namespace MiniERP.API.Entities;

public class InvoiceDetail
{
    public int Id { get; set; }

    public int InvoiceId { get; set; }
    public int ProductId { get; set; }

    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal SubTotal { get; set; }

    public Invoice Invoice { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
