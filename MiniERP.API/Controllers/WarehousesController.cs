using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniERP.API.Constants;
using MiniERP.API.Data;
using MiniERP.API.DTOs;
using MiniERP.API.DTOs.Warehouses;
using MiniERP.API.Services;

namespace MiniERP.API.Controllers;

[ApiController]
[Route("api/warehouses")]
[Authorize]
public class WarehousesController : ControllerBase
{
    private readonly IWarehouseService _service;
    private readonly AppDbContext _db;

    public WarehousesController(
        IWarehouseService service,
        AppDbContext db)
    {
        _service = service;
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var isAdmin = User.IsInRole(Roles.Admin);

        if (isAdmin)
        {
            return Ok(await _service.GetAllAsync(
                null,
                true));
        }

        var employee = await GetCurrentEmployeeAsync();

        if (employee == null)
            return Unauthorized();

        var warehouseIds = employee.EmployeeWarehouses.Select(ew => ew.WarehouseId).ToList();
        if (!warehouseIds.Any())
        {
            return StatusCode(403, new
            {
                message = "Tài khoản chưa được phân công kho. Vui lòng liên hệ quản trị viên."
            });
        }

        return Ok(await _service.GetAllAsync(
            warehouseIds,
            false));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var warehouse = await _service.GetByIdAsync(id);

        if (warehouse == null)
            return NotFound();

        if (!await CanAccessWarehouseAsync(id))
            return Forbid();

        return Ok(warehouse);
    }

    [HttpPost]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Create(
        CreateWarehouseRequest request)
    {
        try
        {
            var warehouse = await _service.CreateAsync(request);

            return CreatedAtAction(
                nameof(GetById),
                new { id = warehouse.Id },
                warehouse);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Update(
        int id,
        UpdateWarehouseRequest request)
    {
        try
        {
            var warehouse = await _service.UpdateAsync(
                id, request);

            if (warehouse == null)
                return NotFound();

            return Ok(warehouse);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var deleted = await _service.DeleteAsync(id);

            if (!deleted)
                return NotFound();

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (DbUpdateException)
        {
            return Conflict(new { message = "Không thể xóa kho do ràng buộc dữ liệu từ database." });
        }
    }

    [HttpGet("{id:int}/employees")]
    public async Task<IActionResult> GetEmployees(int id)
    {
        if (!await _db.Warehouses.AnyAsync(w => w.Id == id))
            return NotFound();

        if (!await CanAccessWarehouseAsync(id))
            return Forbid();

        var employees = await _db.Employees
            .AsNoTracking()
            .Where(e => e.EmployeeWarehouses.Any(ew => ew.WarehouseId == id))
            .Select(e => new EmployeeResponse(
                e.Id,
                e.Name,
                e.Email,
                e.Position,
                e.EmployeeWarehouses.Select(ew => ew.WarehouseId)))
            .ToListAsync();

        return Ok(employees);
    }

    private async Task<MiniERP.API.Entities.Employee?>
        GetCurrentEmployeeAsync()
    {
        var claim = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (!int.TryParse(claim, out var employeeId))
            return null;

        return await _db.Employees
            .Include(e => e.EmployeeWarehouses)
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == employeeId);
    }

    private async Task<bool> CanAccessWarehouseAsync(int id)
    {
        if (User.IsInRole(Roles.Admin))
            return true;

        var employee = await GetCurrentEmployeeAsync();

        return employee != null &&
               employee.EmployeeWarehouses.Any(ew => ew.WarehouseId == id);
    }
}
