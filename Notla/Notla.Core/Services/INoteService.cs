using Notla.Core.Entities;
using Notla.Core.DTOs;
namespace Notla.Core.Services
{
    public interface INoteService : IService<Note>
    {
        Task<NoteDto> GetNoteWithCategoryByIdAsync(int noteId);
        Task<List<Note>> GetNotesWithImagesAsync();
    }
}