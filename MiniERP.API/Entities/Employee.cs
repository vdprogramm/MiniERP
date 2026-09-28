namespace MiniERP.API.Entities;

public class Employee
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";

    public string Position { get; set; } = "SALES_STAFF";

    public ICollection<EmployeeWarehouse> EmployeeWarehouses { get; set; }
        = new List<EmployeeWarehouse>();
    public ICollection<Invoice> Invoices { get; set; }
        = new List<Invoice>();
}
