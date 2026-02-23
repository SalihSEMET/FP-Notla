using Notla.Core.DTOs;
namespace Notla.Core.Services
{
    public interface IUserFavoriteService
    {
        Task ToggleFavoriteAsync(int userId, int noteId);
        Task<List<FavoriteItemDto>> GetUserFavoritesAsync(int userId);
    }
}