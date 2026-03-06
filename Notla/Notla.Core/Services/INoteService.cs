using Notla.Core.Entities;
using Notla.Core.DTOs;
namespace Notla.Core.Services
{
    public interface INoteService : IService<Note>
    {
        Task<NoteDto> GetNoteWithCategoryByIdAsync(int noteId);
        Task<List<NoteDto>> GetNotesWithImagesAsync();
        Task<PagedResultDto<NoteDto>> GetFilteredAndPagedNotesAsync(NoteFilterDto filter);
        Task<List<NoteDto>> GetPendingNotesAsync();
        Task ApproveNoteAsync(int noteId);
        Task RejectNoteAsync(int noteId);
        Task<List<NoteDto>> GetTrendingNotesAsync(int count = 10);
    }
}