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
        public async Task<IActionResult> Checkout()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
            int userId = int.Parse(userIdString);
            try
            {
                var orderDto = await _orderService.CheckoutAsync(userId);
                return Ok(orderDto);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
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
    }
}