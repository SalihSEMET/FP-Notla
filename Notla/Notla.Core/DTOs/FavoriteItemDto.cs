namespace Notla.Core.DTOs
{
    public class FavoriteItemDto
    {
        public int Id { get; set; }
        public int NoteId { get; set; }
        public string Title { get; set; }
        public decimal Price { get; set; }
        public string CoverImageUrl { get; set; }
    }
}