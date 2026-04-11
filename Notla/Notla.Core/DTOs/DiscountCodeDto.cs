namespace Notla.Core.DTOs
{
    public class DiscountCodeDto
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public decimal? DiscountPercentage { get; set; }
        public decimal? DiscountAmount { get; set; }
        public DateTime ExpirationDate { get; set; }
        public decimal? MinimumCartAmount { get; set; }
        public bool IsActive { get; set; }
        public List<int> ApplicableNoteIds { get; set; }
    }
}