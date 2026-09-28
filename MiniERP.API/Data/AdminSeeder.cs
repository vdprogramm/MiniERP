using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MiniERP.API.Constants;
using MiniERP.API.Entities;

namespace MiniERP.API.Data;

public static class AdminSeeder
{
    public static async Task SeedAsync(
        IServiceProvider services)
    {
        using var scope = services.CreateScope();

        var db = scope.ServiceProvider
            .GetRequiredService<AppDbContext>();

        var hasher = scope.ServiceProvider
            .GetRequiredService<IPasswordHasher<Employee>>();

        var config = scope.ServiceProvider
            .GetRequiredService<IConfiguration>();

        var email = config["SeedAdmin:Email"];
        var password = config["SeedAdmin:Password"];

        if (string.IsNullOrWhiteSpace(email) ||
            string.IsNullOrWhiteSpace(password))
            return;

        if (password.Length < 12)
            throw new InvalidOperationException(
                "Admin password must contain at least 12 characters");

        // Chỉ khởi tạo khi bảng Employees hoàn toàn trống.
        if (await db.Employees.AnyAsync())
            return;

        var admin = new Employee
        {
            Name = "System Admin",
            Email = email.Trim().ToLowerInvariant(),
            Position = Roles.Admin,
            EmployeeWarehouses = new List<EmployeeWarehouse>()
        };

        admin.PasswordHash = hasher.HashPassword(
            admin, password);

        db.Employees.Add(admin);

        await db.SaveChangesAsync();
    }
}
