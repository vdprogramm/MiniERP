using System.ComponentModel.DataAnnotations;

namespace MiniERP.API.DTOs.Suppliers;

public class SaveSupplierRequest
{
    [Required, MaxLength(150)]
    public string Name { get; set; } = "";

    [MaxLength(20)]
    public string? Phone { get; set; }

    [MaxLength(255)]
    public string? Address { get; set; }
}

public record SupplierResponse(
    int Id,
    string Name,
    string? Phone,
    string? Address
);
