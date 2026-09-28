using Microsoft.EntityFrameworkCore;
using MiniERP.API.Data;
using MiniERP.API.DTOs.Products;
using MiniERP.API.Entities;

namespace MiniERP.API.Services;

public class ProductService : IProductService
{
    private readonly AppDbContext _db;

    public ProductService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<object> GetAllAsync(
        string? search,
        string? category,
        int page,
        int pageSize)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _db.Products.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var keyword = search.Trim();

            query = query.Where(p =>
                EF.Functions.ILike(p.Name, $"%{keyword}%") ||
                EF.Functions.ILike(p.SKU, $"%{keyword}%"));
        }

        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(p =>
                p.Category == category);
        }

        var totalItems = await query.CountAsync();

        var products = await query
            .OrderBy(p => p.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new ProductResponse(
                p.Id,
                p.Name,
                p.SKU,
                p.Category,
                p.CostPrice,
                p.SalePrice,
                p.Description
            ))
            .ToListAsync();

        return new
        {
            items = products,
            page,
            pageSize,
            totalItems,
            totalPages = (int)Math.Ceiling(
                (double)totalItems / pageSize)
        };
    }

    public async Task<ProductResponse?> GetByIdAsync(int id)
    {
        var product = await _db.Products
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id);

        return product == null
            ? null
            : ProductResponse.From(product);
    }

    public async Task<ProductResponse> CreateAsync(
        CreateProductRequest request)
    {
        var sku = request.SKU.Trim();

        if (await _db.Products.AnyAsync(p => p.SKU == sku))
            throw new InvalidOperationException(
                "SKU đã tồn tại");

        var product = new Product
        {
            Name = request.Name.Trim(),
            SKU = sku,
            Category = request.Category.Trim(),
            CostPrice = request.CostPrice,
            SalePrice = request.SalePrice,
            Description = request.Description
        };

        _db.Products.Add(product);

        await _db.SaveChangesAsync();

        return ProductResponse.From(product);
    }

    public async Task<ProductResponse?> UpdateAsync(
        int id,
        UpdateProductRequest request)
    {
        var product = await _db.Products.FindAsync(id);

        if (product == null)
            return null;

        var sku = request.SKU.Trim();

        if (await _db.Products.AnyAsync(
            p => p.SKU == sku && p.Id != id))
        {
            throw new InvalidOperationException(
                "SKU đã tồn tại");
        }

        product.Name = request.Name.Trim();
        product.SKU = sku;
        product.Category = request.Category.Trim();
        product.CostPrice = request.CostPrice;
        product.SalePrice = request.SalePrice;
        product.Description = request.Description;

        await _db.SaveChangesAsync();

        return ProductResponse.From(product);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var product = await _db.Products.FindAsync(id);

        if (product == null)
            return false;

        var hasReferences =
            await _db.InventoryStocks.AnyAsync(
                x => x.ProductId == id)
            ||
            await _db.InvoiceDetails.AnyAsync(
                x => x.ProductId == id);

        if (hasReferences)
        {
            throw new InvalidOperationException(
                "Không thể xóa sản phẩm đã có tồn kho hoặc hóa đơn");
        }

        _db.Products.Remove(product);

        await _db.SaveChangesAsync();

        return true;
    }

    public async Task<List<string>> GetCategoriesAsync()
    {
        return await _db.Products
            .AsNoTracking()
            .Select(p => p.Category)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();
    }
}
