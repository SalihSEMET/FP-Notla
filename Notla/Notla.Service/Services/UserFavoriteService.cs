using Microsoft.EntityFrameworkCore;
using Notla.Core.DTOs;
using Notla.Core.Entities;
using Notla.Core.Repositories;
using Notla.Core.Services;
using Notla.Core.UnitOfWork;

namespace Notla.Service.Services
{
    public class UserFavoriteService : IUserFavoriteService
    {
        private readonly IGenericRepository<UserFavorite> _favoriteRepository;
        private readonly IGenericRepository<Note> _noteRepository;
        private readonly IUnitOfWork _unitOfWork;

        public UserFavoriteService(
            IGenericRepository<UserFavorite> favoriteRepository,
            IGenericRepository<Note> noteRepository,
            IUnitOfWork unitOfWork)
        {
            _favoriteRepository = favoriteRepository;
            _noteRepository = noteRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<bool> ToggleFavoriteAsync(int userId, int noteId)
        {
            var noteExists = await _noteRepository.Where(n => n.Id == noteId).AnyAsync();
            if (!noteExists) throw new Exception("No such note was found.");

            var existingFav = await _favoriteRepository
                .Where(f => f.UserId == userId && f.NoteId == noteId)
                .FirstOrDefaultAsync();

            bool isFavorite;

            if (existingFav != null)
            {
                existingFav.IsActive = !existingFav.IsActive;
                isFavorite = existingFav.IsActive;
                _favoriteRepository.Update(existingFav);
            }
            else
            {
                await _favoriteRepository.AddAsync(new UserFavorite
                {
                    UserId = userId,
                    NoteId = noteId,
                    IsActive = true
                });
                isFavorite = true;
            }

            await _unitOfWork.CommitAsync();
            return isFavorite;
        }

        public async Task<List<FavoriteItemDto>> GetUserFavoritesAsync(int userId)
        {
            var favorites = await _favoriteRepository
                .Where(f => f.UserId == userId && f.IsActive == true)
                .Include(f => f.Note)
                    .ThenInclude(n => n.Images)
                .Include(f => f.Note) 
                    .ThenInclude(n => n.Reviews)
                .ToListAsync();

            return favorites.Select(f => new FavoriteItemDto
            {
                Id = f.Id,
                NoteId = f.NoteId,
                Title = f.Note.Title,
                Price = f.Note.Price ?? 0,
                CoverImageUrl = f.Note.Images.FirstOrDefault(i => i.IsCover)?.ImageUrl ?? string.Empty,
                CategoryId = f.Note.CategoryId, 
                CreatedDate = f.Note.CreatedDate, 
                Rating = f.Note.Reviews != null && f.Note.Reviews.Any() 
                    ? Math.Round((decimal)f.Note.Reviews.Average(r => r.Rating), 1)
                    : 0
            }).ToList();
        }
    }
}