namespace Notla.Core.Entities
{
    public class UserFollower : BaseEntity
    {
        public int FollowerId { get; set; }
        public User Follower { get; set; }
        public int FollowedId { get; set; }
        public User Followed { get; set; }
    }
}