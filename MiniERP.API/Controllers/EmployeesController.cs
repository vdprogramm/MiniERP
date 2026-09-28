using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniERP.API.Constants;
using MiniERP.API.Data;
using MiniERP.API.DTOs;
using MiniERP.API.Entities;

namespace MiniERP.API.Controllers;

[ApiController]
[Route("api/employees")]
[Authorize(Roles = Roles.Admin)]
public class EmployeesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IPasswordHasher<Employee> _hasher;

    public EmployeesController(
        AppDbContext db,
        IPasswordHasher<Employee> hasher)
    {
        _db = db;
        _hasher = hasher;
    }

    // GET /api/employees
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var employees = await _db.Employees
            .AsNoTracking()
            .Include(e => e.EmployeeWarehouses)
            .OrderBy(e => e.Id)
            .ToListAsync();

        return Ok(employees.Select(EmployeeResponse.From).ToList());
    }

    // GET /api/employees/1
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var employee = await _db.Employees
            .AsNoTracking()
            .Include(e => e.EmployeeWarehouses)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (employee == null)
        {
            return NotFound(new
            {
                message = "Không tìm thấy nhân viên."
            });
        }

        return Ok(EmployeeResponse.From(employee));
    }

    // POST /api/employees
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateEmployeeRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Position))
        {
            return BadRequest(new
            {
                message = "Vui lòng nhập đầy đủ thông tin nhân viên."
            });
        }

        var email = request.Email.Trim().ToLowerInvariant();
        var role = request.Position.Trim().ToUpperInvariant();

        if (!Roles.All.Contains(role))
        {
            return BadRequest(new
            {
                message = "Vai trò không hợp lệ."
            });
        }

        if (await _db.Employees.AnyAsync(e => e.Email == email))
        {
            return Conflict(new
            {
                message = "Email đã tồn tại."
            });
        }

        var warehouseIds = (request.WarehouseIds ?? Array.Empty<int>())
            .Distinct()
            .ToArray();

        if (warehouseIds.Any(id => id <= 0))
        {
            return BadRequest(new
            {
                message = "ID kho không hợp lệ."
            });
        }

        var existingCount = await _db.Warehouses
            .CountAsync(w => warehouseIds.Contains(w.Id));

        if (existingCount != warehouseIds.Length)
        {
            return BadRequest(new
            {
                message = "Danh sách phân công chứa kho không tồn tại."
            });
        }

        var employee = new Employee
        {
            Name = request.Name.Trim(),
            Email = email,
            Position = role
        };

        employee.PasswordHash = _hasher.HashPassword(
            employee,
            request.Password
        );

        foreach (var warehouseId in warehouseIds)
        {
            employee.EmployeeWarehouses.Add(
                new EmployeeWarehouse
                {
                    WarehouseId = warehouseId
                }
            );
        }

        _db.Employees.Add(employee);
        await _db.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetById),
            new { id = employee.Id },
            EmployeeResponse.From(employee)
        );
    }

    // PATCH /api/employees/1/role
    [HttpPatch("{id:int}/role")]
    public async Task<IActionResult> UpdateRole(
        int id,
        [FromBody] UpdateEmployeeRoleRequest request)
    {
        var employee = await _db.Employees
            .Include(e => e.EmployeeWarehouses)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (employee == null)
        {
            return NotFound(new
            {
                message = "Không tìm thấy nhân viên."
            });
        }

        if (string.IsNullOrWhiteSpace(request.Position))
        {
            return BadRequest(new
            {
                message = "Vai trò không được để trống."
            });
        }

        var role = request.Position.Trim().ToUpperInvariant();

        if (!Roles.All.Contains(role))
        {
            return BadRequest(new
            {
                message = "Vai trò không hợp lệ."
            });
        }

        employee.Position = role;

        await _db.SaveChangesAsync();

        return Ok(EmployeeResponse.From(employee));
    }

    // PUT /api/employees/1/warehouses
    [HttpPut("{id:int}/warehouses")]
    public async Task<IActionResult> UpdateWarehouses(
        int id,
        [FromBody] UpdateEmployeeBranchRequest request)
    {
        var employee = await _db.Employees
            .Include(e => e.EmployeeWarehouses)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (employee == null)
        {
            return NotFound(new
            {
                message = "Không tìm thấy nhân viên."
            });
        }

        var warehouseIds = (request.WarehouseIds ?? Array.Empty<int>())
            .Distinct()
            .ToArray();

        if (warehouseIds.Any(warehouseId => warehouseId <= 0))
        {
            return BadRequest(new
            {
                message = "ID kho không hợp lệ."
            });
        }

        var existingCount = await _db.Warehouses
            .CountAsync(w => warehouseIds.Contains(w.Id));

        if (existingCount != warehouseIds.Length)
        {
            return BadRequest(new
            {
                message = "Danh sách phân công chứa kho không tồn tại."
            });
        }

        // Xóa những phân công không còn được chọn.
        var removed = employee.EmployeeWarehouses
            .Where(ew => !warehouseIds.Contains(ew.WarehouseId))
            .ToList();

        foreach (var assignment in removed)
        {
            employee.EmployeeWarehouses.Remove(assignment);
        }

        // Thêm những phân công mới.
        var currentIds = employee.EmployeeWarehouses
            .Select(ew => ew.WarehouseId)
            .ToHashSet();

        foreach (var warehouseId in warehouseIds)
        {
            if (!currentIds.Contains(warehouseId))
            {
                employee.EmployeeWarehouses.Add(
                    new EmployeeWarehouse
                    {
                        EmployeeId = employee.Id,
                        WarehouseId = warehouseId
                    }
                );
            }
        }

        await _db.SaveChangesAsync();

        return Ok(EmployeeResponse.From(employee));
    }
}
