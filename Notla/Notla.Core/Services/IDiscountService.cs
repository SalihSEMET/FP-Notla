using Notla.Core.DTOs;
namespace Notla.Core.Services
{
    public interface IDiscountService
    {
        Task CreateSellerDiscountAsync(int sellerId, CreateDiscountCodeDto dto);
    }
}