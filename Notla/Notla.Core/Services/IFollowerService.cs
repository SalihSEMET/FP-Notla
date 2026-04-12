using Notla.Core.DTOs;

namespace Notla.Core.Services
{
    public interface IFollowerService
    {
        Task<bool> ToggleFollowAsync(int followerId, int followedId);
        Task<List<FollowerDto>> GetMyFollowingAsync(int userId);
        Task<List<FollowerDto>> GetMyFollowersAsync(int sellerId);
    }
}