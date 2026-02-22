using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Notla.Core.Services;
using System.Security.Claims;
namespace Notla.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;
        public CartController(ICartService cartService)
        {
            _cartService = cartService;
        }
        [HttpGet]
        public async Task<IActionResult> GetMyCart()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
            int userId = int.Parse(userIdString);
            var cart = await _cartService.GetCartByUserIdAsync(userId);
            return Ok(cart);
        }
        [HttpPost("Add/{noteId}")]
        public async Task<IActionResult> AddToCart(int noteId)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
            int userId = int.Parse(userIdString);
            try
            {
                await _cartService.AddToCartAsync(userId, noteId);
                return Ok("The item has been successfully added to your cart.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpDelete("Remove/{cartItemId}")]
        public async Task<IActionResult> RemoveFromCart(int cartItemId)
        {
            await _cartService.RemoveFromCartAsync(cartItemId);
            return Ok("Note successfully removed from cart.");
        }
    }
}