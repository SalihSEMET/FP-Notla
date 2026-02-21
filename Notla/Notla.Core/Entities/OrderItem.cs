namespace Notla.Core.Entities
{
    public class OrderItem : BaseEntity
    {
        public int OrderId { get; set; }
        public Order Order { get; set; }
        public int NoteId { get; set; }
        public Note Note { get; set; }
        public decimal Price { get; set; }
    }
}