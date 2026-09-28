using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniERP.API.Constants;
using MiniERP.API.Data;
using MiniERP.API.DTOs.Suppliers;
using MiniERP.API.Entities;

namespace MiniERP.API.Controllers;

[ApiController]
[Route("api/suppliers")]
[Authorize]
public class SuppliersController : ControllerBase
{
    private readonly AppDbContext _db;

    public SuppliersController(AppDbContext db)
    {
        _db = db;
    }

    private static SupplierResponse ToResponse(Supplier s) =>
        new(s.Id, s.Name, s.Phone, s.Address);

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search)
    {
        var query = _db.Suppliers.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var keyword = search.Trim();

            query = query.Where(s =>
                EF.Functions.ILike(s.Name, $"%{keyword}%"));
        }

        var items = await query
            .OrderBy(s => s.Name)
            .Select(s => new SupplierResponse(
                s.Id, s.Name, s.Phone, s.Address))
            .ToListAsync();

        return Ok(items);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var supplier = await _db.Suppliers
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == id);

        return supplier == null
            ? NotFound()
            : Ok(ToResponse(supplier));
    }

    [HttpPost]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Create(
        SaveSupplierRequest request)
    {
        var supplier = new Supplier
        {
            Name = request.Name.Trim(),
            Phone = request.Phone?.Trim() ?? "",
            Address = request.Address?.Trim() ?? ""
        };

        _db.Suppliers.Add(supplier);
        await _db.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetById),
            new { id = supplier.Id },
            ToResponse(supplier));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Update(
        int id,
        SaveSupplierRequest request)
    {
        var supplier = await _db.Suppliers.FindAsync(id);

        if (supplier == null)
            return NotFound();

        supplier.Name = request.Name.Trim();
        supplier.Phone = request.Phone?.Trim() ?? "";
        supplier.Address = request.Address?.Trim() ?? "";

        await _db.SaveChangesAsync();

        return Ok(ToResponse(supplier));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var supplier = await _db.Suppliers.FindAsync(id);

            if (supplier == null)
                return NotFound();

            _db.Suppliers.Remove(supplier);
            await _db.SaveChangesAsync();

            return NoContent();
        }
        catch (DbUpdateException)
        {
            return Conflict(new { message = "Không thể xóa nhà cung cấp do ràng buộc dữ liệu." });
        }
    }
}
