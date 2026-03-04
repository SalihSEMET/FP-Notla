using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Notla.Core.Services;
namespace Notla.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly INoteService _noteService;
        public AdminController(INoteService noteService)
        {
            _noteService = noteService;
        }
        [HttpGet("PendingNotes")]
        public async Task<IActionResult> GetPendingNotes()
        {
            var notes = await _noteService.GetPendingNotesAsync();
            return Ok(notes);
        }
        [HttpPost("ApproveNote/{noteId}")]
        public async Task<IActionResult> ApproveNote(int noteId)
        {
            await _noteService.ApproveNoteAsync(noteId);
            return Ok("The note has been successfully approved and is now on display!");

        }
        [HttpPost("RejectNote/{noteId}")]
        public async Task<IActionResult> RejectNote(int noteId)
        {
            await _noteService.RejectNoteAsync(noteId);
            return Ok("The note was rejected (approval cancelled) and removed from the display.");
        }
    }
}