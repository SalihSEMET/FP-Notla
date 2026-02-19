using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Notla.Core.DTOs;
using Notla.Core.Entities;
using Notla.Core.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
namespace Notla.Service.Services
{
    public class TokenService : ITokenService
    {
        private readonly IConfiguration _configuration;
        public TokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        public TokenDto CreateToken(User user, IList<string> roles)
        {
            var tokenOptions = _configuration.GetSection("TokenOption");
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email ?? ""),
                new Claim(ClaimTypes.Name, user.UserName ?? "")
            };
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenOptions["SecurityKey"]!));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
            var expiration = DateTime.Now.AddMinutes(Convert.ToDouble(tokenOptions["AccessTokenExpiration"]));
            var jwtSecurityToken = new JwtSecurityToken(
                issuer: tokenOptions["Issuer"],
                audience: tokenOptions["Audience"],
                claims: claims,
                expires: expiration,
                signingCredentials: credentials
            );
            var handler = new JwtSecurityTokenHandler();
            var token = handler.WriteToken(jwtSecurityToken);
            return new TokenDto
            {
                AccessToken = token,
                Expiration = expiration
            };
        }
    }
}