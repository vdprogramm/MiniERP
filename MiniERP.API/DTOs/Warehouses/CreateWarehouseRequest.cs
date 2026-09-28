using System.ComponentModel.DataAnnotations;

namespace MiniERP.API.DTOs.Warehouses;

public class CreateWarehouseRequest
{
    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = "";

    [Required]
    [MaxLength(255)]
    public string Location { get; set; } = "";

    public int? ManagerId { get; set; }
}
