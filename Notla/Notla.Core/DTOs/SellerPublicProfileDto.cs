namespace Notla.Core.DTOs
{
    public class SellerPublicProfileDto
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public string ProfileImageUrl { get; set; }
        public string Bio { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}