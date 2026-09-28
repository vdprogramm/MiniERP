namespace MiniERP.API.DTOs.Invoices;

public record InvoiceResponse(
    int Id,
    int WarehouseId,
    int EmployeeId,
    int? CustomerId,
    decimal TotalAmount,
    DateTime CreatedAt,
    List<InvoiceDetailResponse> Items
);
