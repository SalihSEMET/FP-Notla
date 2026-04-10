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

        public UserController(UserManager<User> userManager, IStorageService storageService)
        {
            _userManager = userManager;
            _storageService = storageService;
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
    }
}