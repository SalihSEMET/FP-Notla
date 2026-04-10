using Microsoft.EntityFrameworkCore;
using Notla.Core.DTOs;
using Notla.Core.Entities;
using Notla.Core.Repositories;
using Notla.Core.Services;
using Notla.Core.UnitOfWork;

namespace Notla.Service.Services
{
    public class DiscountService : IDiscountService
    {
        private readonly IGenericRepository<DiscountCode> _discountRepository;
        private readonly IGenericRepository<Note> _noteRepository;
        private readonly IUnitOfWork _unitOfWork;

        public DiscountService(
            IGenericRepository<DiscountCode> discountRepository,
            IGenericRepository<Note> noteRepository,
            IUnitOfWork unitOfWork)
        {
            _discountRepository = discountRepository;
            _noteRepository = noteRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task CreateSellerDiscountAsync(int sellerId, CreateDiscountCodeDto dto)
        {
            if (dto.ApplicableNoteIds == null || !dto.ApplicableNoteIds.Any())
                throw new Exception("You must select at least one note to create a coupon.");
            if (dto.DiscountPercentage == null && dto.DiscountAmount == null)
                throw new Exception("You must specify either a percentage or a fixed amount discount.");

            var validNotesCount = await _noteRepository
                .Where(n => dto.ApplicableNoteIds.Contains(n.Id) && n.SellerId == sellerId)
                .CountAsync();

            if (validNotesCount != dto.ApplicableNoteIds.Count)
                throw new Exception("Some of the notes you selected are either not yours or could not be found.");

            var discountCode = new DiscountCode
            {
                Code = dto.Code.ToUpper(),
                DiscountPercentage = dto.DiscountPercentage,
                DiscountAmount = dto.DiscountAmount,
                ExpirationDate = dto.ExpirationDate,
                MinimumCartAmount = dto.MinimumCartAmount,
                SellerId = sellerId,
                IsActive = true,
                ApplicableNotes = new List<DiscountCodeNote>()
            };

            foreach (var noteId in dto.ApplicableNoteIds)
            {
                discountCode.ApplicableNotes.Add(new DiscountCodeNote
                {
                    NoteId = noteId
                });
            }

            await _discountRepository.AddAsync(discountCode);
            await _unitOfWork.CommitAsync();
        }
        public async Task DeleteSellerDiscountAsync(int sellerId, int discountId)
        {
            var discount = await _discountRepository
                .Where(d => d.Id == discountId && d.SellerId == sellerId)
                .FirstOrDefaultAsync();

            if (discount == null)
                throw new Exception("Discount coupon not found or you don't have permission to delete it.");

            _discountRepository.Remove(discount);
            await _unitOfWork.CommitAsync();
        }
    }
}