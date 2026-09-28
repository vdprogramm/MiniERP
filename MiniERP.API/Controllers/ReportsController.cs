using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniERP.API.Constants;
using MiniERP.API.Data;
using MiniERP.API.Services;

namespace MiniERP.API.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize(Roles = Roles.Admin)]
public class ReportsController : ControllerBase
{
    private readonly IReportService _service;
    private readonly AppDbContext _db;

    public ReportsController(
        IReportService service,
        AppDbContext db)
    {
        _service = service;
        _db = db;
    }

    private async Task<IEnumerable<int>?> GetAllowedWarehouseIdsAsync()
    {
        if (User.IsInRole(Roles.Admin))
            return null;

        var claim = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (!int.TryParse(claim, out var employeeId))
            throw new UnauthorizedAccessException();

        var employee = await _db.Employees
            .Include(e => e.EmployeeWarehouses)
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == employeeId);

        if (employee == null)
            throw new UnauthorizedAccessException();

        var warehouseIds = employee.EmployeeWarehouses.Select(ew => ew.WarehouseId).ToList();
        if (!warehouseIds.Any())
            throw new UnauthorizedAccessException();

        return warehouseIds;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard()
    {
        try
        {
            var warehouseIds =
                await GetAllowedWarehouseIdsAsync();

            return Ok(
                await _service.GetDashboardAsync(
                    warehouseIds));
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpGet("revenue")]
    public async Task<IActionResult> Revenue(
        [FromQuery] DateTime from,
        [FromQuery] DateTime to)
    {
        if (from == default ||
            to == default ||
            from >= to)
        {
            return BadRequest(new
            {
                message = "Khoảng thời gian không hợp lệ"
            });
        }

        // Báo cáo sử dụng thời gian UTC.
        if (from.Kind != DateTimeKind.Utc ||
            to.Kind != DateTimeKind.Utc)
        {
            return BadRequest(new
            {
                message =
                    "Hãy gửi from/to theo UTC, ví dụ 2026-09-01T00:00:00Z"
            });
        }

        try
        {
            var warehouseIds =
                await GetAllowedWarehouseIdsAsync();

            return Ok(
                await _service.GetRevenueAsync(
                    from, to, warehouseIds));
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpGet("top-products")]
    public async Task<IActionResult> TopProducts(
        [FromQuery] int limit = 10)
    {
        if (limit < 1 || limit > 100)
        {
            return BadRequest(new
            {
                message = "Limit phải từ 1 đến 100"
            });
        }

        try
        {
            var warehouseIds =
                await GetAllowedWarehouseIdsAsync();

            return Ok(
                await _service.GetTopProductsAsync(
                    warehouseIds, limit));
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }
}
