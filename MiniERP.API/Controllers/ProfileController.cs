using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniERP.API.Data;

namespace MiniERP.API.Controllers;

[ApiController]
[Route("api/profile")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly AppDbContext _db;

    public ProfileController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        var claim = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (!int.TryParse(claim, out var employeeId))
            return Unauthorized();

        var employee = await _db.Employees
            .AsNoTracking()
            .Where(e => e.Id == employeeId)
            .Select(e => new
            {
                e.Id,
                e.Name,
                e.Email,
                e.Position,

                Warehouses = e.EmployeeWarehouses
                    .Select(ew => new
                    {
                        Id = ew.WarehouseId,
                        Name = ew.Warehouse!.Name
                    })
                    .ToList()
            })
            .FirstOrDefaultAsync();

        if (employee == null)
            return Unauthorized();

        return Ok(employee);
    }
}
