namespace Notla.Core.DTOs
{
    public class NoteCreateDto
    {
        public string Title { get; set; }
        public string Content { get; set; }
        public int CategoryId { get; set; }
    }
}