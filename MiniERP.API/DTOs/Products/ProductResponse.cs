using MiniERP.API.Entities;

namespace MiniERP.API.DTOs.Products;

public record ProductResponse(
    int Id,
    string Name,
    string SKU,
    string Category,
    decimal CostPrice,
    decimal SalePrice,
    string Description
)
{
    public static ProductResponse From(Product product)
        => new(
            product.Id,
            product.Name,
            product.SKU,
            product.Category,
            product.CostPrice,
            product.SalePrice,
            product.Description
        );
}
