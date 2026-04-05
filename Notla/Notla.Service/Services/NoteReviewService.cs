using Microsoft.EntityFrameworkCore;
using Notla.Core.DTOs;
using Notla.Core.Entities;
using Notla.Core.Repositories;
using Notla.Core.Services;
using Notla.Core.UnitOfWork;

namespace Notla.Service.Services
{
    public class NoteReviewService : INoteReviewService
    {
        private readonly IGenericRepository<NoteReview> _reviewRepository;
        private readonly IGenericRepository<UserPurchasedNote> _purchasedNoteRepository;
        private readonly IUnitOfWork _unitOfWork;

        public NoteReviewService(
            IGenericRepository<NoteReview> reviewRepository,
            IGenericRepository<UserPurchasedNote> purchasedNoteRepository,
            IUnitOfWork unitOfWork)
        {
            _reviewRepository = reviewRepository;
            _purchasedNoteRepository = purchasedNoteRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<NoteReviewDto> AddReviewAsync(int userId, NoteReviewCreateDto dto)
        {
            if (dto.Rating < 1 || dto.Rating > 5)
                throw new Exception("Rating can only be between 1 and 5.");
            var hasPurchased = await _purchasedNoteRepository
                .Where(p => p.UserId == userId && p.NoteId == dto.NoteId)
                .AnyAsync();

            if (!hasPurchased)
                throw new Exception("You can only rate the notes you purchased.");

            var alreadyReviewed = await _reviewRepository
                .Where(r => r.UserId == userId && r.NoteId == dto.NoteId)
                .AnyAsync();

            if (alreadyReviewed)
                throw new Exception("You've already made an assessment on this note. You can't do it a second time.");

            var review = new NoteReview
            {
                NoteId = dto.NoteId,
                UserId = userId,
                Rating = dto.Rating,
                Comment = dto.Comment
            };

            await _reviewRepository.AddAsync(review);
            await _unitOfWork.CommitAsync();

            return new NoteReviewDto
            {
                Id = review.Id,
                NoteId = review.NoteId,
                UserId = review.UserId,
                Rating = review.Rating,
                Comment = review.Comment
            };
        }

        public async Task<List<NoteReviewDto>> GetReviewsByNoteIdAsync(int noteId)
        {
            var reviews = await _reviewRepository.Where(r => r.NoteId == noteId).Include(r => r.User).ToListAsync();

            return reviews.Select(r => new NoteReviewDto
            {
                Id = r.Id,
                NoteId = r.NoteId,
                UserId = r.UserId,
                UserName = r.User.UserName,
                ProfileImageUrl = r.User.ProfileImageUrl,
                Rating = r.Rating,
                Comment = r.Comment
            }).ToList();
        }
    }
}