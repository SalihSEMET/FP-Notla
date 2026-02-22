using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Notla.Core.DTOs;
using Notla.Core.Entities;
using Notla.Core.Services;
using Notla.Core.Repositories;
using Notla.Core.UnitOfWork;
namespace Notla.Service.Services
{
    public class OrderService : IOrderService
    {
        private readonly IGenericRepository<Order> _orderRepository;
        private readonly IGenericRepository<UserPurchasedNote> _purchasedNoteRepository;
        private readonly IGenericRepository<Cart> _cartRepository;
        private readonly IGenericRepository<CartItem> _cartItemRepository;
        private readonly UserManager<User> _userManager;
        private readonly IUnitOfWork _unitOfWork;
        public OrderService(
            IGenericRepository<Order> orderRepository,
            IGenericRepository<UserPurchasedNote> purchasedNoteRepository,
            IGenericRepository<Cart> cartRepository,
            IGenericRepository<CartItem> cartItemRepository,
            UserManager<User> userManager,
            IUnitOfWork unitOfWork
        )
        {
            _orderRepository = orderRepository;
            _purchasedNoteRepository = purchasedNoteRepository;
            _cartRepository = cartRepository;
            _cartItemRepository = cartItemRepository;
            _userManager = userManager;
            _unitOfWork = unitOfWork;
        }
        public async Task<OrderDto> CheckoutAsync(int userId)
        {
            var cart = await _cartRepository.Where(c => c.UserId == userId)
            .Include(c => c.CartItems)
            .ThenInclude(ci => ci.Note)
            .FirstOrDefaultAsync();
            if (cart == null || !cart.CartItems.Any())
                throw new Exception("Your basket is empty! There's nothing to buy.");
            var buyer = await _userManager.FindByIdAsync(userId.ToString());
            if (buyer == null) throw new Exception("User not found.");
            decimal totalAmount = cart.CartItems.Sum(ci => ci.Note.Price ?? 0);
            if (buyer.WalletBalance < totalAmount) throw new Exception($"Insufficient balance! Basket total:{totalAmount} TL,Bakiyeniz:{buyer.WalletBalance} TL");
            buyer.WalletBalance -= totalAmount;
            var order = new Order
            {
                UserId = userId,
                TotalAmount = totalAmount,
                OrderStatus = "Completed",
                OrderItems = new List<OrderItem>()
            };
            var purchasedNoteTitles = new List<string>();
            foreach (var item in cart.CartItems)
            {
                order.OrderItems.Add(new OrderItem
                {
                    NoteId = item.NoteId,
                    Price = item.Note.Price ?? 0
                });
                await _purchasedNoteRepository.AddAsync(new UserPurchasedNote
                {
                    UserId = userId,
                    NoteId = item.NoteId
                });
                var seller = await _userManager.FindByIdAsync(item.Note.SellerId.ToString());
                if (seller != null)
                {
                    seller.WalletBalance += item.Note.Price ?? 0;
                    await _userManager.UpdateAsync(seller);
                }
                purchasedNoteTitles.Add(item.Note.Title);
            }
            await _orderRepository.AddAsync(order);
            _cartItemRepository.RemoveRange(cart.CartItems);
            await _userManager.UpdateAsync(buyer);
            await _unitOfWork.CommitAsync();
            return new OrderDto
            {
                Id = order.Id,
                TotalAmount = order.TotalAmount,
                OrderStatus = order.OrderStatus,
                CreatedDate = DateTime.Now,
                PurchasedNoteTitles = purchasedNoteTitles
            };
        }
        public async Task<List<LibraryItemDto>> GetMyLibraryAsync(int userId)
        {
            var purchasedNotes = await _purchasedNoteRepository.Where(p => p.UserId == userId)
            .Include(p => p.Note)
            .ThenInclude(n => n.Images)
            .ToListAsync();
            return purchasedNotes.Select(p => new LibraryItemDto
            {
                NoteId = p.NoteId,
                Title = p.Note.Title,
                CoverImageUrl = p.Note.Images.FirstOrDefault(i => i.IsCover)?.ImageUrl ?? string.Empty,
                OriginalPdfUrl = p.Note.OriginalPdfUrl
            }).ToList();
        }
        public async Task<List<OrderDto>> GetMyOrdersAsync(int userId)
        {
            var orders = await _orderRepository.Where(o => o.UserId == userId)
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.Note)
            .ToListAsync();
            return orders.Select(o => new OrderDto
            {
                Id = o.Id,
                TotalAmount = o.TotalAmount,
                OrderStatus = o.OrderStatus,
                CreatedDate = o.CreatedDate,
                PurchasedNoteTitles = o.OrderItems.Select(oi => oi.Note.Title).ToList()
            }).ToList();
        }
    }
}
