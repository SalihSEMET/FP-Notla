namespace Notla.Core.DTOs
{
    public class UserProfileDto
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string UserName { get; set; }
        public string? Bio { get; set; }
        public string? ProfileImageUrl { get; set; }
        public decimal WalletBalance { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}