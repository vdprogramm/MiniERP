using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using MiniERP.API.Entities;

namespace MiniERP.API.Services;

public class JwtService : IJwtService
{
    private readonly IConfiguration _config;

    public JwtService(IConfiguration config)
    {
        _config = config;
    }

    public string GenerateToken(Employee employee)
    {
        var key = _config["Jwt:Key"]
            ?? throw new InvalidOperationException(
                "JWT Key is missing");

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier,
                employee.Id.ToString()),

            new(ClaimTypes.Name, employee.Name),

            new(ClaimTypes.Email, employee.Email),

            new(ClaimTypes.Role, employee.Position)
        };

        var signingKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(key));

        var credentials = new SigningCredentials(
            signingKey,
            SecurityAlgorithms.HmacSha256);

        var expires = int.Parse(
            _config["Jwt:ExpireMinutes"] ?? "60");

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expires),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler()
            .WriteToken(token);
    }
}
