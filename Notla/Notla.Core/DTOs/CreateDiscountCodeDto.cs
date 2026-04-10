namespace Notla.Core.DTOs
{
    public class CreateDiscountCodeDto
    {
        public string Code { get; set; }
        public decimal? DiscountPercentage { get; set; }
        public decimal? DiscountAmount { get; set; } 
        public DateTime ExpirationDate { get; set; }
        public decimal MinimumCartAmount { get; set; }
        public List<int> ApplicableNoteIds { get; set; }
    }
}