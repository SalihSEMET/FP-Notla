namespace Notla.Core.Entities
{
    public class NoteReview : BaseEntity
    {
        public int NoteId { get; set; }
        public Note Note { get; set; }
        public int UserId { get; set; }
        public User User { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; }
    }
}