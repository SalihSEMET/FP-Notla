using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Notla.Core.DTOs;
using Notla.Core.Services;
using System.Security.Claims;

namespace Notla.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class DiscountController : ControllerBase
    {
        private readonly IDiscountService _discountService;

        public DiscountController(IDiscountService discountService)
        {
            _discountService = discountService;
        }

        [HttpPost("CreateSellerDiscount")]
        public async Task<IActionResult> CreateSellerDiscount([FromBody] CreateDiscountCodeDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

            int sellerId = int.Parse(userIdStr);

            await _discountService.CreateSellerDiscountAsync(sellerId, dto);

            return Ok("Your seller-specific discount coupon has been successfully generated.");
        }
    }
}