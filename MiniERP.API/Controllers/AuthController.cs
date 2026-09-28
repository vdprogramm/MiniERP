using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniERP.API.Data;
using MiniERP.API.DTOs;
using MiniERP.API.Entities;
using MiniERP.API.Services;

namespace MiniERP.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IJwtService _jwt;
    private readonly IPasswordHasher<Employee> _hasher;

    public AuthController(
        AppDbContext db,
        IJwtService jwt,
        IPasswordHasher<Employee> hasher)
    {
        _db = db;
        _jwt = jwt;
        _hasher = hasher;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        var employee = await _db.Employees
            .FirstOrDefaultAsync(e => e.Email == email);

        if (employee == null)
        {
            return Unauthorized(new
            {
                message = "Email hoặc mật khẩu không đúng"
            });
        }

        var result = _hasher.VerifyHashedPassword(
            employee,
            employee.PasswordHash,
            request.Password);

        if (result == PasswordVerificationResult.Failed)
        {
            return Unauthorized(new
            {
                message = "Email hoặc mật khẩu không đúng"
            });
        }

        if (result ==
            PasswordVerificationResult.SuccessRehashNeeded)
        {
            employee.PasswordHash = _hasher.HashPassword(
                employee, request.Password);

            await _db.SaveChangesAsync();
        }

        var token = _jwt.GenerateToken(employee);

        return Ok(new
        {
            accessToken = token,
            tokenType = "Bearer",
            employee = EmployeeResponse.From(employee)
        });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var id = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (!int.TryParse(id, out var employeeId))
            return Unauthorized();

        var employee = await _db.Employees
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == employeeId);

        if (employee == null)
            return Unauthorized();

        return Ok(EmployeeResponse.From(employee));
    }
}
