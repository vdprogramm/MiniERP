using System.ComponentModel.DataAnnotations;

namespace MiniERP.API.DTOs;

public class UpdateEmployeeRoleRequest
{
    [Required]
    public string Position { get; set; } = "";
}
