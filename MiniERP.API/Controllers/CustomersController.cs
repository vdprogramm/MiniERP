using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniERP.API.Constants;
using MiniERP.API.DTOs.Customers;
using MiniERP.API.Services;

namespace MiniERP.API.Controllers;

[ApiController]
[Route("api/customers")]
[Authorize]
public class CustomersController : ControllerBase
{
    private readonly ICustomerService _service;

    public CustomersController(
        ICustomerService service)
    {
        _service = service;
    }

    // GET /api/customers
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await _service.GetAllAsync(
            search, page, pageSize);

        return Ok(result);
    }

    // GET /api/customers/1
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var customer = await _service.GetByIdAsync(id);

        if (customer == null)
        {
            return NotFound(new
            {
                message = "Không tìm thấy khách hàng"
            });
        }

        return Ok(customer);
    }

    // POST /api/customers
    [HttpPost]
    [Authorize(Roles =
        Roles.Admin + "," +
        Roles.SalesStaff + "," +
        Roles.BranchManager)]
    public async Task<IActionResult> Create(
        CreateCustomerRequest request)
    {
        try
        {
            var customer = await _service.CreateAsync(
                request);

            return CreatedAtAction(
                nameof(GetById),
                new { id = customer.Id },
                customer);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new
            {
                message = ex.Message
            });
        }
    }

    // PUT /api/customers/1
    [HttpPut("{id:int}")]
    [Authorize(Roles =
        Roles.Admin + "," +
        Roles.SalesStaff + "," +
        Roles.BranchManager)]
    public async Task<IActionResult> Update(
        int id,
        UpdateCustomerRequest request)
    {
        try
        {
            var customer = await _service.UpdateAsync(
                id, request);

            if (customer == null)
                return NotFound();

            return Ok(customer);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new
            {
                message = ex.Message
            });
        }
    }

    // DELETE /api/customers/1
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
            return Conflict(new
            {
                message = ex.Message
            });
        }
        catch (DbUpdateException)
        {
            return Conflict(new { message = "Không thể xóa khách hàng do có dữ liệu liên kết." });
        }
    }
}
