using Notla.Core.DTOs;
using Notla.Core.Entities;
namespace Notla.Core.Services
{
    public interface ITokenService
    {
        TokenDto CreateToken(User user, IList<string> roles);
    }
}