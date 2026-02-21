namespace Notla.Core.Entities
{
    public class CartItem : BaseEntity
    {
        public int CartId { get; set; }
        public Cart Cart { get; set; }
        public int NoteId { get; set; }
        public Note Note { get; set; }
    }
}