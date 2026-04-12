using Notla.Core.DTOs;

namespace Notla.Core.Services
{
    public interface IUserFavoriteService
    {
        Task<bool> ToggleFavoriteAsync(int userId, int noteId);
        Task<List<FavoriteItemDto>> GetUserFavoritesAsync(int userId);
    }
}