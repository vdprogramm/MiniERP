namespace MiniERP.API.Entities;

public class EmployeeWarehouse
{
    public int EmployeeId { get; set; }
    public Employee? Employee { get; set; }

    public int WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }
}
