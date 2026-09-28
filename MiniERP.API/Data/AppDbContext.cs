using Microsoft.EntityFrameworkCore;
using MiniERP.API.Entities;

namespace MiniERP.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Warehouse> Warehouses => Set<Warehouse>();
    public DbSet<EmployeeWarehouse> EmployeeWarehouses => Set<EmployeeWarehouse>();
    public DbSet<InventoryStock> InventoryStocks => Set<InventoryStock>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoiceDetail> InvoiceDetails => Set<InvoiceDetail>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Employee
        modelBuilder.Entity<Employee>(entity =>
        {
            entity.HasIndex(e => e.Email).IsUnique();
        });

        // EmployeeWarehouse
        modelBuilder.Entity<EmployeeWarehouse>(entity =>
        {
            entity.HasKey(ew => new { ew.EmployeeId, ew.WarehouseId });

            entity.HasOne(ew => ew.Employee)
                .WithMany(e => e.EmployeeWarehouses)
                .HasForeignKey(ew => ew.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(ew => ew.Warehouse)
                .WithMany(w => w.EmployeeWarehouses)
                .HasForeignKey(ew => ew.WarehouseId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Warehouse
        modelBuilder.Entity<Warehouse>(entity =>
        {
            entity.HasOne(w => w.Manager)
                .WithMany()
                .HasForeignKey(w => w.ManagerId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Product
        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasIndex(p => p.SKU).IsUnique();

            entity.Property(p => p.CostPrice)
                .HasPrecision(18, 2);

            entity.Property(p => p.SalePrice)
                .HasPrecision(18, 2);

            entity.ToTable(t =>
            {
                t.HasCheckConstraint(
                    "CK_Products_CostPrice",
                    "\"CostPrice\" >= 0");

                t.HasCheckConstraint(
                    "CK_Products_SalePrice",
                    "\"SalePrice\" >= 0");
            });
        });

        // Inventory
        modelBuilder.Entity<InventoryStock>(entity =>
        {
            entity.HasIndex(i => new
            {
                i.WarehouseId,
                i.ProductId
            }).IsUnique();

            entity.HasOne(i => i.Warehouse)
                .WithMany(w => w.InventoryStocks)
                .HasForeignKey(i => i.WarehouseId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(i => i.Product)
                .WithMany(p => p.InventoryStocks)
                .HasForeignKey(i => i.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.ToTable(t =>
                t.HasCheckConstraint(
                    "CK_Inventory_Quantity",
                    "\"Quantity\" >= 0"));
        });

        // Invoice
        modelBuilder.Entity<Invoice>(entity =>
        {
            entity.Property(i => i.TotalAmount)
                .HasPrecision(18, 2);

            entity.HasIndex(i => new
            {
                i.WarehouseId,
                i.CreatedAt
            });

            entity.HasOne(i => i.Employee)
                .WithMany(e => e.Invoices)
                .HasForeignKey(i => i.EmployeeId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(i => i.Customer)
                .WithMany(c => c.Invoices)
                .HasForeignKey(i => i.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(i => i.Warehouse)
                .WithMany(w => w.Invoices)
                .HasForeignKey(i => i.WarehouseId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Invoice Detail
        modelBuilder.Entity<InvoiceDetail>(entity =>
        {
            entity.Property(d => d.UnitPrice)
                .HasPrecision(18, 2);

            entity.Property(d => d.SubTotal)
                .HasPrecision(18, 2);

            entity.HasOne(d => d.Invoice)
                .WithMany(i => i.InvoiceDetails)
                .HasForeignKey(d => d.InvoiceId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(d => d.Product)
                .WithMany(p => p.InvoiceDetails)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Customer>()
            .ToTable(t => t.HasCheckConstraint(
                "CK_Customers_Points",
                "\"MembershipPoints\" >= 0"));
    }
}
