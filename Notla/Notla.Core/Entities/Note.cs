namespace Notla.Core.Entities
{
    public class Note : BaseEntity
    {
        public string Title { get; set; }
        public string Content { get; set; }
        public decimal? Price { get; set; }
        public string DemoPdfUrl { get; set; }
        public string OriginalPdfUrl { get; set; }
        public string? FileUrl { get; set; }
        public string? CoverImageUrl { get; set; }
        public int CategoryId { get; set; }
        public Category Category { get; set; }
        public int SellerId { get; set; }
        public User Seller { get; set; }
        public ICollection<NoteReview> Reviews { get; set; }
        public ICollection<NoteImage> Images { get; set; }
        public bool IsApproved { get; set; } = false;
        public Note()
        {
            Images = new HashSet<NoteImage>();
        }
    }
}