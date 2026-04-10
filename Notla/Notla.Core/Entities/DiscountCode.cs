namespace Notla.Core.Entities
{
    public class DiscountCode : BaseEntity
    {
        public string Code { get; set; }
        
        public decimal? DiscountPercentage { get; set; } 
        public decimal? DiscountAmount { get; set; }     
        
        public bool IsActive { get; set; }
        public DateTime ExpirationDate { get; set; }
        public int SellerId { get; set; }
        public decimal? MinimumCartAmount { get; set; }
        public ICollection<DiscountCodeNote> ApplicableNotes { get; set; }
    }
}