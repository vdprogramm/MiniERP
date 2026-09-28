using MiniERP.API.DTOs.Invoices;

namespace MiniERP.API.Services;

public interface IInvoiceService
{
    Task<InvoiceResponse> CreateAsync(
        int employeeId,
        CreateInvoiceRequest request);

    Task<InvoiceResponse?> GetByIdAsync(int id);

    Task<List<InvoiceResponse>> GetAllAsync(
        IEnumerable<int>? warehouseIds);
}
