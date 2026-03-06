using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Notla.Core.Services;
using System.Security.Claims;

namespace Notla.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class FollowerController : ControllerBase
    {
        private readonly IFollowerService _followerService;

        public FollowerController(IFollowerService followerService)
        {
            _followerService = followerService;
        }
        [HttpPost("ToggleFollow/{followedId}")]
        public async Task<IActionResult> ToggleFollow(int followedId)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

            int followerId = int.Parse(userIdStr);
            var resultMessage = await _followerService.ToggleFollowAsync(followerId, followedId);

            return Ok(new { Message = resultMessage });
        }
        [HttpGet("MyFollowing")]
        public async Task<IActionResult> GetMyFollowing()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

            int userId = int.Parse(userIdStr);

            var followingList = await _followerService.GetMyFollowingAsync(userId);
            return Ok(followingList);
        }
        [HttpGet("MyFollowers")]
        public async Task<IActionResult> GetMyFollowers()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

            int userId = int.Parse(userIdStr);

            var followersList = await _followerService.GetMyFollowersAsync(userId);
            return Ok(followersList);
        }
    }
}