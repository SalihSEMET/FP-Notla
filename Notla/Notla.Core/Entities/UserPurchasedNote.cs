namespace Notla.Core.Entities
{
    public class UserPurchasedNote : BaseEntity
    {
        public string UserId { get; set; }
        public User User { get; set; }
        public int NoteId { get; set; }
        public Note Note { get; set; }
    }
}