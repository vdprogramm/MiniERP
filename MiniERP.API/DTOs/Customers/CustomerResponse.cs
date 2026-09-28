using MiniERP.API.Entities;

namespace MiniERP.API.DTOs.Customers;

public record CustomerResponse(
    int Id,
    string Name,
    string Phone,
    string? Email,
    string? Address,
    int MembershipPoints
)
{
    public static CustomerResponse From(Customer customer)
        => new(
            customer.Id,
            customer.Name,
            customer.Phone,
            customer.Email,
            customer.Address,
            customer.MembershipPoints
        );
}
