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
        public async Task<List<Note>> GetNotesWithImagesAsync()
        {
            return await _repository.Where(x => true)
            .Include(x => x.Images)
            .ToListAsync();
        }
        public async Task<PagedResultDto<NoteDto>> GetFilteredAndPagedNotesAsync(NoteFilterDto filter)
        {
            var query = _repository.Where(n => true)
                .Include(n => n.Images)
                .Include(n => n.Reviews)
                .AsNoTracking();
            if (!string.IsNullOrWhiteSpace(filter.SearchText))
            {
                var lowerSearch = filter.SearchText.ToLower();
                query = query.Where(n => n.Title.ToLower().Contains(lowerSearch) ||
                                         n.Content.ToLower().Contains(lowerSearch));
            }
            if (filter.CategoryId.HasValue && filter.CategoryId.Value > 0)
            {
                query = query.Where(n => n.CategoryId == filter.CategoryId.Value);
            }
            query = filter.SortBy?.ToLower() switch
            {
                "price_asc" => query.OrderBy(n => n.Price),
                "price_desc" => query.OrderByDescending(n => n.Price),
                "rating_desc" => query.OrderByDescending(n => n.Reviews.Any() ? n.Reviews.Average(r => r.Rating) : 0),
                "newest" => query.OrderByDescending(n => n.CreatedDate),
                _ => query.OrderByDescending(n => n.CreatedDate)
            };
            var totalCount = await query.CountAsync();
            var pagedNotes = await query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();
            var noteDtos = _mapper.Map<List<NoteDto>>(pagedNotes);
            return new PagedResultDto<NoteDto>
            {
                Items = noteDtos,
                TotalCount = totalCount,
                PageNumber = filter.PageNumber,
                PageSize = filter.PageSize
            };
        }

    }
}