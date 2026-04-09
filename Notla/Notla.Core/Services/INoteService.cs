using Notla.Core.Entities;
using Notla.Core.DTOs;
namespace Notla.Core.Services
{
    public interface INoteService : IService<Note>
    {
        Task<NoteDto> GetNoteWithCategoryByIdAsync(int noteId);
        Task<List<NoteDto>> GetNotesWithImagesAsync();
        Task<PagedResultDto<NoteDto>> GetFilteredAndPagedNotesAsync(NoteFilterDto filter);
        Task<List<AdminNoteDto>> GetPendingNotesAsync();
        Task ApproveNoteAsync(int noteId);
        Task RejectNoteAsync(int noteId);
        Task<List<NoteDto>> GetTrendingNotesAsync(int count = 10);
        Task<List<NoteDto>> GetMySellingNotesAsync(int sellerId);
    }
}