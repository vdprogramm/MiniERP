using MiniERP.API.DTOs.Customers;

namespace MiniERP.API.Services;

public interface ICustomerService
{
    Task<object> GetAllAsync(
        string? search,
        int page,
        int pageSize);

    Task<CustomerResponse?> GetByIdAsync(int id);

    Task<CustomerResponse> CreateAsync(
        CreateCustomerRequest request);

    Task<CustomerResponse?> UpdateAsync(
        int id,
        UpdateCustomerRequest request);

    Task<bool> DeleteAsync(int id);
}
