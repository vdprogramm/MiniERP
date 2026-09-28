using System.ComponentModel.DataAnnotations;

namespace MiniERP.API.DTOs;

public class CreateEmployeeRequest
{
    [Required]
    public string Name { get; set; } = "";

    [Required]
    [EmailAddress]
    public string Email { get; set; } = "";

    [Required]
    [MinLength(8)]
    public string Password { get; set; } = "";

    public IEnumerable<int> WarehouseIds { get; set; } = Array.Empty<int>();

    [Required]
    public string Position { get; set; } = "";
}
