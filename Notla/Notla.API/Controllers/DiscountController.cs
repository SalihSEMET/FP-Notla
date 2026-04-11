using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Notla.Core.DTOs;
using Notla.Core.Services;
using System.Security.Claims;

namespace Notla.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DiscountController : ControllerBase
    {
        private readonly IDiscountService _discountService;

        public DiscountController(IDiscountService discountService)
        {
            _discountService = discountService;
        }

        [Authorize]
        [HttpGet("MyDiscounts")]
        public async Task<IActionResult> GetMyDiscounts()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

            int sellerId = int.Parse(userIdStr);
            var discounts = await _discountService.GetSellerDiscountsAsync(sellerId);
            return Ok(discounts);
        }

        [Authorize]
        [HttpPost("CreateSellerDiscount")]
        public async Task<IActionResult> CreateSellerDiscount([FromBody] CreateDiscountCodeDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

            int sellerId = int.Parse(userIdStr);

            await _discountService.CreateSellerDiscountAsync(sellerId, dto);

            return Ok("Your seller-specific discount coupon has been successfully generated.");
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSellerDiscount(int id)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

            int sellerId = int.Parse(userIdStr);

            try
            {
                await _discountService.DeleteSellerDiscountAsync(sellerId, id);
                return Ok(new { message = "Discount coupon successfully deleted." });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [AllowAnonymous]
        [HttpGet("Note/{noteId}")]
        public async Task<IActionResult> GetDiscountsForNote(int noteId)
        {
            var discounts = await _discountService.GetDiscountsForNoteAsync(noteId);
            return Ok(discounts);
        }
    }
}