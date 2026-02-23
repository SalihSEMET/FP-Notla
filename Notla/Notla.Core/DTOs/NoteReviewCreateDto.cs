namespace Notla.Core.DTOs
{
    public class NoteReviewCreateDto
    {
        public int NoteId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; }
    }
}