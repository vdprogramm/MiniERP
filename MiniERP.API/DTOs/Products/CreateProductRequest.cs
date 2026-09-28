using System.ComponentModel.DataAnnotations;

namespace MiniERP.API.DTOs.Products;

public class CreateProductRequest
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = "";

    [Required]
    [MaxLength(50)]
    public string SKU { get; set; } = "";

    [Required]
    [MaxLength(100)]
    public string Category { get; set; } = "";

    [Range(0, 9999999999999999.99)]
    public decimal CostPrice { get; set; }

    [Range(0, 9999999999999999.99)]
    public decimal SalePrice { get; set; }

    public string Description { get; set; } = "";
}
