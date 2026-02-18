namespace Notla.Core.DTOs
{
    public class NoteDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public decimal? Price { get; set; }
        public int CategoryId { get; set; }
    }
}