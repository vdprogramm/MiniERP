using MiniERP.API.Entities;

namespace MiniERP.API.DTOs;

public record EmployeeResponse(
    int Id,
    string Name,
    string Email,
    string Position,
    IEnumerable<int> WarehouseIds
)
{
    public static EmployeeResponse From(Employee employee)
        => new(
            employee.Id,
            employee.Name,
            employee.Email,
            employee.Position,
            employee.EmployeeWarehouses?
                .Select(ew => ew.WarehouseId)
                .OrderBy(id => id)
                .ToArray() ?? Array.Empty<int>()
        );
}
