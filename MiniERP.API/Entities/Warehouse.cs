namespace MiniERP.API.Entities;

public class Warehouse
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Location { get; set; } = "";

    public int? ManagerId { get; set; }
    public Employee? Manager { get; set; }

    public ICollection<EmployeeWarehouse> EmployeeWarehouses { get; set; }
        = new List<EmployeeWarehouse>();

    public ICollection<InventoryStock> InventoryStocks { get; set; }
        = new List<InventoryStock>();

    public ICollection<Invoice> Invoices { get; set; }
        = new List<Invoice>();
}
