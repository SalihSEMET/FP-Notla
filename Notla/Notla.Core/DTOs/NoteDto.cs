namespace Notla.Core.DTOs
{
    public class NoteDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public decimal? Price { get; set; }
        public int CategoryId { get; set; }
        public int SellerId { get; set; }
        public string DemoPdfUrl { get; set; }
        public string CoverImageUrl { get; set; }
        public List<string> SampleImageUrls { get; set; }
        public decimal Rating { get; set; }
        public int ReviewCount { get; set; }
        public int ViewCount { get; set; }
        public int SalesCount { get; set; }
    }
}