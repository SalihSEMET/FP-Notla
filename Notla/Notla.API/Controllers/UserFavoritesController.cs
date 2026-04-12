using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Notla.Core.Services;
using System.Security.Claims;

namespace Notla.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UserFavoritesController : ControllerBase
    {
        private readonly IUserFavoriteService _favoriteService;

        public UserFavoritesController(IUserFavoriteService favoriteService)
        {
            _favoriteService = favoriteService;
        }

        [HttpPost("Toggle/{noteId}")]
        public async Task<IActionResult> ToggleFavorite(int noteId)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

            int userId = int.Parse(userIdString);

            try
            {
                bool isFavorite = await _favoriteService.ToggleFavoriteAsync(userId, noteId);
                return Ok(new { isFavorite = isFavorite });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("MyFavorites")]
        public async Task<IActionResult> GetMyFavorites()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

            int userId = int.Parse(userIdString);
            var favs = await _favoriteService.GetUserFavoritesAsync(userId);
            return Ok(favs);
        }
    }
}