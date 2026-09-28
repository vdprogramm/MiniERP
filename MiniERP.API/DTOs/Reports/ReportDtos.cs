namespace MiniERP.API.DTOs.Reports;

public record DashboardResponse(
    decimal TotalRevenue,
    int TotalInvoices,
    int TotalProducts,
    int TotalCustomers,
    int LowStockCount
);

public record RevenueByDayResponse(
    DateTime Date,
    decimal Revenue,
    int InvoiceCount
);

public record TopProductResponse(
    int ProductId,
    string ProductName,
    int QuantitySold,
    decimal Revenue
);
