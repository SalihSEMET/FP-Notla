using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Notla.Core.Entities;
using Notla.Core.DTOs;
using Notla.Core.Repositories;
using Notla.Core.Services;
using Notla.Core.UnitOfWork;
namespace Notla.Service.Services
{
    public class NoteService : Service<Note>, INoteService
    {
        private readonly IGenericRepository<Note> _repository;
        private readonly IMapper _mapper;
        public NoteService(IGenericRepository<Note> repository, IUnitOfWork unitOfWork, IMapper mapper) : base(repository, unitOfWork)
        {
            _repository = repository;
            _mapper = mapper;
        }
        public async Task<NoteDto> GetNoteWithCategoryByIdAsync(int noteId)
        {
            var note = await _repository.Where(x => x.Id == noteId)
                                        .Include(x => x.Category)
                                        .SingleOrDefaultAsync();
            return _mapper.Map<NoteDto>(note);
        }

    }
}