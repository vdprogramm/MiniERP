namespace MiniERP.API.Entities;

public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Phone { get; set; } = "";

    public string? Email { get; set; }
    public string? Address { get; set; }

    public int MembershipPoints { get; set; }

    public ICollection<Invoice> Invoices { get; set; }
        = new List<Invoice>();
}
