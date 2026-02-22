using Microsoft.EntityFrameworkCore;
using Notla.Core.DTOs;
using Notla.Core.Entities;
using Notla.Core.Repositories;
using Notla.Core.Services;
using Notla.Core.UnitOfWork;
namespace Notla.Service.Services
{
    public class CartService : ICartService
    {
        private readonly IGenericRepository<Cart> _cartRepository;
        private readonly IGenericRepository<CartItem> _carItemRepository;
        private readonly IGenericRepository<Note> _noteRepository;
        private readonly IUnitOfWork _unitOfWork;
        public CartService
        (
            IGenericRepository<Cart> cartRepository,
            IGenericRepository<CartItem> cartItemRepository,
            IGenericRepository<Note> noteRepository,
            IUnitOfWork unitOfWork
        )
        {
            _cartRepository = cartRepository;
            _carItemRepository = cartItemRepository;
            _noteRepository = noteRepository;
            _unitOfWork = unitOfWork;
        }
        public async Task AddToCartAsync(int userId, int noteId)
        {
            var noteExists = await _noteRepository.Where(n => n.Id == noteId).AnyAsync();
            if (!noteExists) throw new Exception("No such note was found!");
            var cart = await _cartRepository.Where(c => c.UserId == userId)
                                                .Include(c => c.CartItems)
                                                .FirstOrDefaultAsync();
            if (cart == null)
            {
                cart = new Cart { UserId = userId };
                await _cartRepository.AddAsync(cart);
                await _unitOfWork.CommitAsync();
            }
            if (cart.CartItems.Any(ci => ci.NoteId == noteId))
            {
                throw new Exception("This note is already in your cart!");
            }
            await _carItemRepository.AddAsync(new CartItem
            {
                CartId = cart.Id,
                NoteId = noteId
            });
            await _unitOfWork.CommitAsync();
        }
        public async Task<CartDto> GetCartByUserIdAsync(int userId)
        {
            var cart = await _cartRepository.Where(c => c.UserId == userId)
                .Include(c => c.CartItems)
                .ThenInclude(ci => ci.Note)
                .ThenInclude(n => n.Images)
                .FirstOrDefaultAsync();
            if (cart == null) return new CartDto { UserId = userId };
            var cartDto = new CartDto
            {
                Id = cart.Id,
                UserId = cart.UserId,
                CartItems = cart.CartItems.Select(ci => new CartItemDto
                {
                    Id = ci.Id,
                    NoteId = ci.NoteId,
                    Title = ci.Note.Title,
                    Price = ci.Note.Price ?? 0,
                    CoverImageUrl = ci.Note.Images.FirstOrDefault(i => i.IsCover)?.ImageUrl ?? string.Empty
                }).ToList()
            };
            return cartDto;
        }
        public async Task RemoveFromCartAsync(int cartItemId)
        {
            var cartItem = await _carItemRepository.Where(ci => ci.Id == cartItemId).FirstOrDefaultAsync();
            if (cartItem != null)
            {
                _carItemRepository.Remove(cartItem);
                await _unitOfWork.CommitAsync();
            }
        }
    }
}