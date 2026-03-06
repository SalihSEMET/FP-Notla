using Microsoft.EntityFrameworkCore;
using Notla.Core.DTOs;
using Notla.Core.Entities;
using Notla.Core.Repositories;
using Notla.Core.Services;
using Notla.Core.UnitOfWork;

namespace Notla.Service.Services
{
    public class FollowerService : IFollowerService
    {
        private readonly IGenericRepository<UserFollower> _followerRepository;
        private readonly IUnitOfWork _unitOfWork;

        public FollowerService(IGenericRepository<UserFollower> followerRepository, IUnitOfWork unitOfWork)
        {
            _followerRepository = followerRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<string> ToggleFollowAsync(int followerId, int followedId)
        {
            if (followerId == followedId)
                throw new Exception("You can't keep track of yourself.");
            var existingFollow = await _followerRepository
                .Where(f => f.FollowerId == followerId && f.FollowedId == followedId)
                .FirstOrDefaultAsync();

            if (existingFollow != null)
            {
                if (existingFollow.IsActive)
                {
                    existingFollow.IsActive = false;
                    _followerRepository.Update(existingFollow);
                    await _unitOfWork.CommitAsync();
                    return "The follower has been unfollowed.";
                }
                else
                {
                    existingFollow.IsActive = true;
                    _followerRepository.Update(existingFollow);
                    await _unitOfWork.CommitAsync();
                    return "Tracked successfully!";
                }
            }
            else
            {
                var newFollow = new UserFollower
                {
                    FollowerId = followerId,
                    FollowedId = followedId,
                    IsActive = true
                };
                await _followerRepository.AddAsync(newFollow);
                await _unitOfWork.CommitAsync();
                return "It was followed up successfully.";
            }
        }
        public async Task<List<FollowerDto>> GetMyFollowingAsync(int userId)
        {
            var followingList = await _followerRepository
                .Where(f => f.FollowerId == userId && f.IsActive == true)
                .Include(f => f.Followed)
                .Select(f => new FollowerDto
                {
                    UserId = f.Followed.Id,
                    UserName = f.Followed.UserName,
                    Email = f.Followed.Email
                })
                .ToListAsync();

            return followingList;
        }
        public async Task<List<FollowerDto>> GetMyFollowersAsync(int sellerId)
        {
            var followersList = await _followerRepository
                .Where(f => f.FollowedId == sellerId && f.IsActive == true)
                .Include(f => f.Follower)
                .Select(f => new FollowerDto
                {
                    UserId = f.Follower.Id,
                    UserName = f.Follower.UserName,
                    Email = f.Follower.Email
                })
                .ToListAsync();

            return followersList;
        }
    }
}