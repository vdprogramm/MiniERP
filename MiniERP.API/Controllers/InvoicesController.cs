using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniERP.API.Constants;
using MiniERP.API.Data;
using MiniERP.API.DTOs.Invoices;
using MiniERP.API.Services;
using Npgsql;

namespace MiniERP.API.Controllers;

[ApiController]
[Route("api/invoices")]
[Authorize]
public class InvoicesController : ControllerBase
{
    private readonly IInvoiceService _service;
    private readonly AppDbContext _db;

    public InvoicesController(
        IInvoiceService service,
        AppDbContext db)
    {
        _service = service;
        _db = db;
    }

    private int? CurrentEmployeeId
    {
        get
        {
            var claim = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            return int.TryParse(claim, out var id)
                ? id
                : null;
        }
    }

    private async Task<int[]> GetWarehouseIdsAsync(int employeeId)
    {
        return await _db.EmployeeWarehouses
            .AsNoTracking()
            .Where(ew => ew.EmployeeId == employeeId)
            .Select(ew => ew.WarehouseId)
            .ToArrayAsync();
    }

    [HttpPost]
    [Authorize(Roles =
        Roles.Admin + "," +
        Roles.SalesStaff + "," +
        Roles.BranchManager)]
    public async Task<IActionResult> Create(
        CreateInvoiceRequest request)
    {
        if (!CurrentEmployeeId.HasValue)
            return Unauthorized();

        try
        {
            var invoice = await _service.CreateAsync(
                CurrentEmployeeId.Value,
                request);

            return CreatedAtAction(
                nameof(GetById),
                new { id = invoice.Id },
                invoice);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
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
        catch (DbUpdateException ex)
            when (ex.InnerException is PostgresException pg &&
                  pg.SqlState == "40001")
        {
            return Conflict(new
            {
                message = "Tồn kho đang được cập nhật bởi giao dịch khác. Vui lòng thử lại."
            });
        }
        catch (PostgresException ex)
            when (ex.SqlState == "40001")
        {
            return Conflict(new
            {
                message = "Tồn kho đang được cập nhật bởi giao dịch khác. Vui lòng thử lại."
            });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        if (!CurrentEmployeeId.HasValue)
            return Unauthorized();

        IEnumerable<int>? warehouseIds = null;

        if (!User.IsInRole(Roles.Admin))
        {
            warehouseIds = await GetWarehouseIdsAsync(
                CurrentEmployeeId.Value);

            if (warehouseIds == null || !warehouseIds.Any())
                return Forbid();
        }

        return Ok(await _service.GetAllAsync(
            warehouseIds));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        if (!CurrentEmployeeId.HasValue)
            return Unauthorized();

        var invoice = await _service.GetByIdAsync(id);

        if (invoice == null)
            return NotFound();

        if (!User.IsInRole(Roles.Admin))
        {
            var warehouseIds = await GetWarehouseIdsAsync(
                CurrentEmployeeId.Value);

            if (warehouseIds == null || !warehouseIds.Contains(invoice.WarehouseId))
                return Forbid();
        }

        return Ok(invoice);
    }
}
