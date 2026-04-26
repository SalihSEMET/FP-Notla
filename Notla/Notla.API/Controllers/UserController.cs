using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using Notla.Core.Entities;
using Notla.Core.DTOs;
using Notla.Core.Services;

namespace Notla.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly IStorageService _storageService;
        private readonly IOrderService _orderService;
        private readonly INoteService _noteService;

        public UserController(UserManager<User> userManager, IStorageService storageService, IOrderService orderService, INoteService noteService)
        {
            _userManager = userManager;
            _storageService = storageService;
            _orderService = orderService;
            _noteService = noteService;
        }

        [HttpGet("Profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

            var user = await _userManager.FindByIdAsync(userIdStr);
            if (user == null) return NotFound("User not found.");

            var profileDto = new UserProfileDto
            {
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                UserName = user.UserName,
                Bio = user.Bio,
                ProfileImageUrl = user.ProfileImageUrl,
                WalletBalance = user.WalletBalance,
                CreatedDate = user.CreatedDate
            };

            return Ok(profileDto);
        }

        [HttpPut("UpdateProfile")]
        public async Task<IActionResult> UpdateProfile([FromForm] UserUpdateProfileDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

            var user = await _userManager.FindByIdAsync(userIdStr);
            if (user == null) return NotFound("User not found.");

            if (dto.Bio != null)
            {
                user.Bio = dto.Bio;
            }

            if (dto.ProfileImage != null)
            {
                var fileName = await _storageService.UploadFileAsync("profiles", dto.ProfileImage);
                user.ProfileImageUrl = fileName; 
            }

            var result = await _userManager.UpdateAsync(user);
            if (result.Succeeded)
            {
                return Ok(new { message = "Profile updated successfully.", profileImageUrl = user.ProfileImageUrl });
            }

            return BadRequest(result.Errors);
        }

        [AllowAnonymous]
        [HttpGet("PublicProfile/{id}")]
        public async Task<IActionResult> GetPublicProfile(int id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null) return NotFound("Seller not found.");

            var profile = new SellerPublicProfileDto
            {
                Id = user.Id,
                UserName = user.UserName,
                ProfileImageUrl = user.ProfileImageUrl,
                Bio = user.Bio,
                CreatedDate = user.CreatedDate
            };

            return Ok(profile);
        }

        [HttpGet("DashboardStats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
            int sellerId = int.Parse(userIdStr);

            var activeNotesCount = await _noteService.GetActiveNotesCountAsync(sellerId);
            var totalViews = await _noteService.GetTotalViewsAsync(sellerId);
            var totalEarnings = await _orderService.GetTotalHistoricalEarningsAsync(sellerId);
            var totalSales = await _orderService.GetTotalSalesCountAsync(sellerId);

            var dto = new SellerDashboardDto
            {
                ActiveNotesCount = activeNotesCount,
                TotalViews = totalViews,
                TotalEarnings = totalEarnings,
                TotalSales = totalSales
            };

            return Ok(dto);
        }
    }
}