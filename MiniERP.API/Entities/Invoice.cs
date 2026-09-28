namespace MiniERP.API.Entities;

public class Invoice
{
    public int Id { get; set; }

    public int EmployeeId { get; set; }
    public int? CustomerId { get; set; }
    public int WarehouseId { get; set; }

    public decimal TotalAmount { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Employee Employee { get; set; } = null!;
    public Customer? Customer { get; set; }
    public Warehouse Warehouse { get; set; } = null!;

    public ICollection<InvoiceDetail> InvoiceDetails { get; set; }
        = new List<InvoiceDetail>();
}
