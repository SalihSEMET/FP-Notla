using Notla.Core.Entities;

namespace Notla.Core.Entities
{
    public class UserFavorite : BaseEntity
    {
        public int UserId { get; set; }
        public User User { get; set; }
        public int NoteId { get; set; }
        public Note Note { get; set; }
    }
}