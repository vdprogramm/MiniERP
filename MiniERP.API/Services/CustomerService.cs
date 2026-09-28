using Microsoft.EntityFrameworkCore;
using MiniERP.API.Data;
using MiniERP.API.DTOs.Customers;
using MiniERP.API.Entities;

namespace MiniERP.API.Services;

public class CustomerService : ICustomerService
{
    private readonly AppDbContext _db;

    public CustomerService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<object> GetAllAsync(
        string? search,
        int page,
        int pageSize)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _db.Customers
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var keyword = search.Trim();

            query = query.Where(c =>
                EF.Functions.ILike(
                    c.Name, $"%{keyword}%") ||
                EF.Functions.ILike(
                    c.Phone, $"%{keyword}%"));
        }

        var totalItems = await query.CountAsync();

        var customers = await query
            .OrderBy(c => c.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new CustomerResponse(
                c.Id,
                c.Name,
                c.Phone,
                c.Email,
                c.Address,
                c.MembershipPoints
            ))
            .ToListAsync();

        return new
        {
            items = customers,
            page,
            pageSize,
            totalItems,
            totalPages = (int)Math.Ceiling(
                (double)totalItems / pageSize)
        };
    }

    public async Task<CustomerResponse?> GetByIdAsync(int id)
    {
        var customer = await _db.Customers
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id);

        return customer == null
            ? null
            : CustomerResponse.From(customer);
    }

    public async Task<CustomerResponse> CreateAsync(
        CreateCustomerRequest request)
    {
        var phone = request.Phone.Trim();

        var exists = await _db.Customers
            .AnyAsync(c => c.Phone == phone);

        if (exists)
        {
            throw new InvalidOperationException(
                "Số điện thoại đã tồn tại");
        }

        var customer = new Customer
        {
            Name = request.Name.Trim(),
            Phone = phone,
            Email = request.Email?.Trim(),
            Address = request.Address?.Trim(),
            MembershipPoints = request.MembershipPoints
        };

        _db.Customers.Add(customer);

        await _db.SaveChangesAsync();

        return CustomerResponse.From(customer);
    }

    public async Task<CustomerResponse?> UpdateAsync(
        int id,
        UpdateCustomerRequest request)
    {
        var customer = await _db.Customers
            .FindAsync(id);

        if (customer == null)
            return null;

        var phone = request.Phone.Trim();

        var phoneExists = await _db.Customers
            .AnyAsync(c =>
                c.Phone == phone &&
                c.Id != id);

        if (phoneExists)
        {
            throw new InvalidOperationException(
                "Số điện thoại đã tồn tại");
        }

        customer.Name = request.Name.Trim();
        customer.Phone = phone;
        customer.Email = request.Email?.Trim();
        customer.Address = request.Address?.Trim();
        customer.MembershipPoints = request.MembershipPoints;

        await _db.SaveChangesAsync();

        return CustomerResponse.From(customer);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var customer = await _db.Customers
            .FindAsync(id);

        if (customer == null)
            return false;

        var hasInvoices = await _db.Invoices
            .AnyAsync(i => i.CustomerId == id);

        if (hasInvoices)
        {
            throw new InvalidOperationException(
                "Không thể xóa khách hàng đã có hóa đơn");
        }

        _db.Customers.Remove(customer);

        await _db.SaveChangesAsync();

        return true;
    }
}
