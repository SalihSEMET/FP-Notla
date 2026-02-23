using Notla.Core.DTOs;
namespace Notla.Core.Services
{
    public interface INoteReviewService
    {
        Task<NoteReviewDto> AddReviewAsync(int userId, NoteReviewCreateDto dto);
        Task<List<NoteReviewDto>> GetReviewsByNoteIdAsync(int noteId);
    }
}