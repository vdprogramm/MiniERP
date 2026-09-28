using MiniERP.API.Entities;

namespace MiniERP.API.Services;

public interface IJwtService
{
    string GenerateToken(Employee employee);
}
