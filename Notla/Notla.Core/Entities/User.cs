using Microsoft.AspNetCore.Identity;
namespace Notla.Core.Entities
{
    public class User : IdentityUser<int>
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string? Bio { get; set; }
        public string? ProfileImageUrl { get; set; }
        public decimal WalletBalance { get; set; } = 0;
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public bool IsDeleted { get; set; } = false;
        public ICollection<UserFollower> Following { get; set; }
        public ICollection<UserFollower> Followers { get; set; }
    }
}