using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Notla.Core.DTOs;
using Notla.Core.Entities;
using Notla.Core.Repositories;
using Notla.Core.Services;
using Notla.Core.UnitOfWork;

namespace Notla.Service.Services
{
    public class OrderService : IOrderService
    {
        private readonly IGenericRepository<Order> _orderRepository;
        private readonly IGenericRepository<UserPurchasedNote> _purchasedNoteRepository;
        private readonly IGenericRepository<Cart> _cartRepository;
        private readonly IGenericRepository<CartItem> _cartItemRepository;
        private readonly IGenericRepository<DiscountCode> _discountRepository;
        private readonly UserManager<User> _userManager;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEmailService _emailService;
        private readonly INotificationService _notificationService;

        public OrderService(
            IGenericRepository<Order> orderRepository,
            IGenericRepository<UserPurchasedNote> purchasedNoteRepository,
            IGenericRepository<Cart> cartRepository,
            IGenericRepository<CartItem> cartItemRepository,
            IGenericRepository<DiscountCode> discountRepository,
            UserManager<User> userManager,
            IUnitOfWork unitOfWork,
            INotificationService notificationService,
            IEmailService emailService)
        {
            _orderRepository = orderRepository;
            _purchasedNoteRepository = purchasedNoteRepository;
            _cartRepository = cartRepository;
            _cartItemRepository = cartItemRepository;
            _discountRepository = discountRepository;
            _userManager = userManager;
            _unitOfWork = unitOfWork;
            _emailService = emailService;
            _notificationService = notificationService;
        }
        public async Task<OrderDto> CheckoutAsync(int userId, string? discountCode = null)
        {
            var cart = await _cartRepository.Where(c => c.UserId == userId)
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Note)
                .FirstOrDefaultAsync();

            if (cart == null || !cart.CartItems.Any())
                throw new Exception("Your cart is empty. There's nothing to buy.");

            var buyer = await _userManager.FindByIdAsync(userId.ToString());
            if (buyer == null) throw new Exception("User not found.");

            decimal originalTotalAmount = cart.CartItems.Sum(ci => ci.Note.Price ?? 0);
            decimal finalTotalAmount = originalTotalAmount;
            decimal discountMultiplier = 1m;
            List<int> applicableNoteIds = new List<int>();

            if (!string.IsNullOrWhiteSpace(discountCode))
            {
                var discount = await _discountRepository
                    .Where(d => d.Code == discountCode && d.IsActive && d.ExpirationDate > DateTime.Now)
                    .Include(d => d.ApplicableNotes)
                    .FirstOrDefaultAsync();

                if (discount == null)
                    throw new Exception("Invalid or expired discount code!");

                if (discount.MinimumCartAmount.HasValue && discount.MinimumCartAmount.Value > 0)
                {
                    decimal sellerSubtotal = cart.CartItems
                        .Where(ci => ci.Note.SellerId == discount.SellerId)
                        .Sum(ci => ci.Note.Price ?? 0);

                    if (sellerSubtotal < discount.MinimumCartAmount.Value)
                        throw new Exception($"Insufficient balance for this seller's coupon! Minimum required: {discount.MinimumCartAmount.Value} TL");
                }
                discountMultiplier = (100m - discount.DiscountPercentage) / 100m;
                applicableNoteIds = discount.ApplicableNotes.Select(an => an.NoteId).ToList();


                finalTotalAmount = 0;
                foreach (var item in cart.CartItems)
                {
                    if (applicableNoteIds.Contains(item.NoteId))
                        finalTotalAmount += (item.Note.Price ?? 0) * discountMultiplier;
                    else
                        finalTotalAmount += (item.Note.Price ?? 0);
                }
            }

            if (buyer.WalletBalance < finalTotalAmount)
                throw new Exception($"Insufficient balance! Discounted Basket amount: {finalTotalAmount} TL, Your balance: {buyer.WalletBalance} TL");

            buyer.WalletBalance -= finalTotalAmount;

            var order = new Order
            {
                UserId = userId,
                TotalAmount = finalTotalAmount,
                OrderStatus = "Completed",
                OrderItems = new List<OrderItem>()
            };

            var purchasedNoteTitles = new List<string>();

            foreach (var item in cart.CartItems)
            {
                decimal itemOriginalPrice = item.Note.Price ?? 0;
                decimal currentItemDiscountedPrice = applicableNoteIds.Contains(item.NoteId)
                    ? itemOriginalPrice * discountMultiplier
                    : itemOriginalPrice;

                order.OrderItems.Add(new OrderItem
                {
                    NoteId = item.NoteId,
                    Price = currentItemDiscountedPrice
                });

                await _purchasedNoteRepository.AddAsync(new UserPurchasedNote
                {
                    UserId = userId,
                    NoteId = item.NoteId
                });
                decimal commissionRate = 0.10m;
                decimal platformCut = currentItemDiscountedPrice * commissionRate;
                decimal sellerCut = currentItemDiscountedPrice - platformCut;

                var seller = await _userManager.FindByIdAsync(item.Note.SellerId.ToString());
                if (seller != null)
                {
                    seller.WalletBalance += sellerCut;
                    await _userManager.UpdateAsync(seller);
                }

                var adminUser = await _userManager.FindByEmailAsync("admin@notla.com");
                if (adminUser != null)
                {
                    adminUser.WalletBalance += platformCut;
                    await _userManager.UpdateAsync(adminUser);
                }

                purchasedNoteTitles.Add(item.Note.Title);
                item.Note.SalesCount++;
            }

            await _orderRepository.AddAsync(order);
            _cartItemRepository.RemoveRange(cart.CartItems);

            await _userManager.UpdateAsync(buyer);
            await _unitOfWork.CommitAsync();
            try
            {
                string subject = "Note - Your order has been successfully received.";
                string body = $@"
                    <h2>Hello {buyer.UserName}, Thank you for choosing us.</h2>
                    <p>Your order has been successfully confirmed and you have received the notes. <b>To your library</b> added</p>
                    <hr />
                    <h3>Order Summary:</h3>
                    <ul>
                        <li><b>Order Amount:</b> {finalTotalAmount} TL</li>
                        <li><b>Order Date:</b> {DateTime.Now.ToString("dd.MM.yyyy HH:mm")}</li>
                        <li><b>Notes Taken:</b> {string.Join(", ", purchasedNoteTitles)}</li>
                    </ul>
                    <hr />
                    <p>We wish you endless success in your exams and projects.</p>
                    <p><b>Team Notla</b></p>";

                await _emailService.SendEmailAsync(buyer.Email, subject, body);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Mail gönderilemedi: {ex.Message}");
            }
            try
            {
                var sellerIds = cart.CartItems.Select(ci => ci.Note.SellerId).Distinct().ToList();
                foreach (var sellerId in sellerIds)
                {
                    string message = $"Congratulations One of your notes on the site was just purchased by {buyer.UserName}";
                    await _notificationService.SendNotificationToUserAsync(sellerId.ToString(), message);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Live notification could not be sent: {ex.Message}");
            }

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