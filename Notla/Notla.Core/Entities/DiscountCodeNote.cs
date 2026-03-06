namespace Notla.Core.Entities
{
    public class DiscountCodeNote : BaseEntity
    {
        public int DiscountCodeId { get; set; }
        public DiscountCode DiscountCode { get; set; }
        public int NoteId { get; set; }
        public Note Note { get; set; }
    }
}