using MiniERP.API.DTOs.Products;

namespace MiniERP.API.Services;

public interface IProductService
{
    Task<object> GetAllAsync(
        string? search,
        string? category,
        int page,
        int pageSize);

    Task<ProductResponse?> GetByIdAsync(int id);

    Task<ProductResponse> CreateAsync(
        CreateProductRequest request);

    Task<ProductResponse?> UpdateAsync(
        int id,
        UpdateProductRequest request);

    Task<bool> DeleteAsync(int id);

    Task<List<string>> GetCategoriesAsync();
}
