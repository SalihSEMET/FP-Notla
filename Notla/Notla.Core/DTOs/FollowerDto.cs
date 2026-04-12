namespace Notla.Core.DTOs
{
    public class FollowerDto
    {
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string? Email { get; set; }
        public string? ProfileImageUrl { get; set; } 
    }
}