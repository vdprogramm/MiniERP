namespace MiniERP.API.DTOs.Invoices;

public record InvoiceDetailResponse(
    int ProductId,
    string ProductName,
    int Quantity,
    decimal UnitPrice,
    decimal Subtotal
);
