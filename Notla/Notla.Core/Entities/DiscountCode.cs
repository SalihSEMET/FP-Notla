namespace Notla.Core.Entities
{
    public class DiscountCode : BaseEntity
    {
        public string Code { get; set; }
        public decimal DiscountPercentage { get; set; }
        public bool IsActive { get; set; }
        public DateTime ExpiryDate { get; set; }
    }
}