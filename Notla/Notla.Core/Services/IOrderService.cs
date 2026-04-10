using Notla.Core.DTOs;

namespace Notla.Core.Services
{
    public interface IOrderService
    {
        Task<OrderDto> CheckoutAsync(int userId, List<string>? discountCodes = null);
        Task<List<OrderDto>> GetMyOrdersAsync(int userId);
        Task<List<LibraryItemDto>> GetMyLibraryAsync(int userId);
        Task<decimal> PreviewDiscountAsync(int userId, List<string>? discountCodes = null);
    }
}