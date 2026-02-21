namespace Notla.Core.Entities
{
    public class NoteImage : BaseEntity
    {
        public int NoteId { get; set; }
        public Note Note { get; set; }
        public string ImageUrl { get; set; }
        public bool IsCover { get; set; } = false;
    }
}