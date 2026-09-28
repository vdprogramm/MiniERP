using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiniERP.API.Constants;
using MiniERP.API.DTOs.Products;
using MiniERP.API.Services;

namespace MiniERP.API.Controllers;

[ApiController]
[Route("api/products")]
[Authorize]
public class ProductsController : ControllerBase
{
    private readonly IProductService _service;

    public ProductsController(IProductService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? category,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await _service.GetAllAsync(
            search, category, page, pageSize);

        return Ok(result);
    }

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        return Ok(await _service.GetCategoriesAsync());
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var product = await _service.GetByIdAsync(id);

        if (product == null)
            return NotFound(new
            {
                message = "Không tìm thấy sản phẩm"
            });

        return Ok(product);
    }

    [HttpPost]
    [Authorize(Roles = Roles.Admin + "," + Roles.BranchManager)]
    public async Task<IActionResult> Create(
        CreateProductRequest request)
    {
        try
        {
            var product = await _service.CreateAsync(request);

            return CreatedAtAction(
                nameof(GetById),
                new { id = product.Id },
                product);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = Roles.Admin + "," + Roles.BranchManager)]
    public async Task<IActionResult> Update(
        int id,
        UpdateProductRequest request)
    {
        try
        {
            var product = await _service.UpdateAsync(
                id, request);

            if (product == null)
                return NotFound();

            return Ok(product);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = Roles.Admin + "," + Roles.BranchManager)]
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
    }
}
