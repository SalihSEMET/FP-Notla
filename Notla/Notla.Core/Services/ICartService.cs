using Notla.Core.DTOs;
namespace Notla.Core.Services
{
    public interface ICartService
    {
        Task<CartDto> GetCartByUserIdAsync(int userId);
        Task AddToCartAsync(int userId, int noteId);
        Task RemoveFromCartAsync(int cartItemId);
    }
}