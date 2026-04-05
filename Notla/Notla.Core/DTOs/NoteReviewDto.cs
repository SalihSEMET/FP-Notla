namespace Notla.Core.DTOs
{
    public class NoteReviewDto
    {
        public int Id { get; set; }
        public int NoteId { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string? ProfileImageUrl { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
    }
}