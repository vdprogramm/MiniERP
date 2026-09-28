using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniERP.API.Constants;
using MiniERP.API.Data;
using MiniERP.API.DTOs.Inventory;
using MiniERP.API.Services;

namespace MiniERP.API.Controllers;

[ApiController]
[Route("api/inventory")]
[Authorize(Roles =
    Roles.Admin + "," +
    Roles.WarehouseManager + "," +
    Roles.SalesStaff + "," +
    Roles.BranchManager)]
public class InventoryController : ControllerBase
{
    private readonly IInventoryService _service;
    private readonly AppDbContext _db;

    public InventoryController(
        IInventoryService service,
        AppDbContext db)
    {
        _service = service;
        _db = db;
    }

    private bool IsAdmin =>
        User.IsInRole(Roles.Admin);

    private async Task<IEnumerable<int>?> GetCurrentWarehouseIdsAsync()
    {
        var claim = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (!int.TryParse(claim, out var employeeId))
            return null;

        var employee = await _db.Employees
            .Include(e => e.EmployeeWarehouses)
            .AsNoTracking()
            .Where(e => e.Id == employeeId)
            .FirstOrDefaultAsync();

        if (employee == null) return null;
        var ids = employee.EmployeeWarehouses.Select(ew => ew.WarehouseId).ToList();
        return ids.Any() ? ids : null;
    }

    private async Task<bool> CanAccessAsync(
        int warehouseId)
    {
        if (IsAdmin)
            return true;

        var warehouseIds = await GetCurrentWarehouseIdsAsync();

        return warehouseIds != null &&
               warehouseIds.Contains(warehouseId);
    }

    private async Task<bool> CanManageAsync(int warehouseId)
    {
        if (IsAdmin)
            return true;

        if (!User.IsInRole(Roles.WarehouseManager) &&
            !User.IsInRole(Roles.BranchManager))
            return false;

        return await CanAccessAsync(warehouseId);
    }

    // GET /api/inventory
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        if (IsAdmin)
            return Ok(await _service.GetAllAsync());

        var warehouseIds = await GetCurrentWarehouseIdsAsync();

        if (warehouseIds == null || !warehouseIds.Any())
            return Forbid();

        return Ok(await _service.GetAllAsync(
            warehouseIds));
    }

    // GET /api/inventory/warehouse/1
    [HttpGet("warehouse/{warehouseId:int}")]
    public async Task<IActionResult> GetByWarehouse(
        int warehouseId)
    {
        if (!await _db.Warehouses.AnyAsync(w => w.Id == warehouseId))
            return NotFound();

        if (!await CanAccessAsync(warehouseId))
            return Forbid();

        return Ok(await _service.GetAllAsync(
            new[] { warehouseId }));
    }

    // GET /api/inventory/low-stock?threshold=5
    [HttpGet("low-stock")]
    public async Task<IActionResult> GetLowStock(
        [FromQuery] int threshold = 5)
    {
        if (threshold < 0)
            return BadRequest(new
            {
                message = "Ngưỡng tồn kho không được âm."
            });

        if (IsAdmin)
        {
            return Ok(await _service.GetLowStockAsync(
                threshold));
        }

        var warehouseIds = await GetCurrentWarehouseIdsAsync();

        if (warehouseIds == null || !warehouseIds.Any())
            return Forbid();

        return Ok(await _service.GetLowStockAsync(
            threshold,
            warehouseIds));
    }

    // POST /api/inventory
    [HttpPost]
    [Authorize(Roles =
        Roles.Admin + "," +
        Roles.WarehouseManager + "," +
        Roles.BranchManager)]
    public async Task<IActionResult> Create(
        CreateInventoryRequest request)
    {
        if (!await CanManageAsync(request.WarehouseId))
            return Forbid();

        try
        {
            var result = await _service.CreateAsync(
                request);

            return StatusCode(201, result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new
            {
                message = ex.Message
            });
        }
    }

    // POST /api/inventory/adjust
    [HttpPost("adjust")]
    [Authorize(Roles =
        Roles.Admin + "," +
        Roles.WarehouseManager + "," +
        Roles.BranchManager)]
    public async Task<IActionResult> Adjust(
        AdjustInventoryRequest request)
    {
        if (!await CanManageAsync(request.WarehouseId))
            return Forbid();

        try
        {
            var result = await _service.AdjustAsync(
                request);

            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new
            {
                message = ex.Message
            });
        }
    }
}



