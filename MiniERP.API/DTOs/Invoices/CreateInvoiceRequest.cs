using System.ComponentModel.DataAnnotations;

namespace MiniERP.API.DTOs.Invoices;

public class CreateInvoiceRequest
{
    [Range(1, int.MaxValue)]
    public int WarehouseId { get; set; }

    public int? CustomerId { get; set; }

    [Required]
    [MinLength(1)]
    public List<CreateInvoiceItemRequest> Items { get; set; } = new();
}

public class CreateInvoiceItemRequest
{
    [Range(1, int.MaxValue)]
    public int ProductId { get; set; }

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }
}
