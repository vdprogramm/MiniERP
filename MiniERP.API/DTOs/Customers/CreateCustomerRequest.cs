using System.ComponentModel.DataAnnotations;

namespace MiniERP.API.DTOs.Customers;

public class CreateCustomerRequest
{
    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = "";

    [Required]
    [Phone]
    [MaxLength(20)]
    public string Phone { get; set; } = "";

    [EmailAddress]
    public string? Email { get; set; }

    public string? Address { get; set; }

    public int MembershipPoints { get; set; }
}
