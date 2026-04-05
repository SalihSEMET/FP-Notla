using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Notla.Core.Services;
using System.Security.Claims;
namespace Notla.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;
        public OrdersController(IOrderService orderService)
        {
            _orderService = orderService;
        }
        [HttpPost("Checkout")]
        public async Task<IActionResult> Checkout([FromQuery] string? discountCode = null)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
            int userId = int.Parse(userIdString);
            var orderDto = await _orderService.CheckoutAsync(userId, discountCode);
            return Ok(orderDto);
        }
        [HttpGet("MyOrders")]
        public async Task<IActionResult> GetMyOrders()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
            int userId = int.Parse(userIdString);
            var orders = await _orderService.GetMyOrdersAsync(userId);
            return Ok(orders);
        }
        [HttpGet("MyLibrary")]
        public async Task<IActionResult> GetMyLibrary()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
            int userId = int.Parse(userIdString);
            var library = await _orderService.GetMyLibraryAsync(userId);
            return Ok(library);
        }
        [HttpGet("Preview")]
        public async Task<IActionResult> PreviewCheckout([FromQuery] string discountCode)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
            int userId = int.Parse(userIdString);

            var newTotal = await _orderService.PreviewDiscountAsync(userId, discountCode);
            return Ok(new { newTotal });
        }
    }
}