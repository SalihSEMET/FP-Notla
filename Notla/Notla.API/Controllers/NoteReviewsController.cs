using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Notla.Core.DTOs;
using Notla.Core.Services;
using System.Security.Claims;
namespace Notla.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NoteReviewsController : ControllerBase
    {
        private readonly INoteReviewService _noteReviewService;
        public NoteReviewsController(INoteReviewService noteReviewService)
        {
            _noteReviewService = noteReviewService;
        }
        [HttpGet("Note/{noteId}")]
        public async Task<IActionResult> GetReviewsByNoteId(int noteId)
        {
            var reviews = await _noteReviewService.GetReviewsByNoteIdAsync(noteId);
            return Ok(reviews);
        }
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> AddReview([FromBody] NoteReviewCreateDto dto)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
            int userId = int.Parse(userIdString);

            var review = await _noteReviewService.AddReviewAsync(userId, dto);
            return StatusCode(201, review);
        }
    }
}