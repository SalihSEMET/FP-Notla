namespace Notla.Core.DTOs
{
    public class OrderDto
    {
        public int Id { get; set; }
        public decimal TotalAmount { get; set; }
        public string OrderStatus { get; set; }
        public DateTime CreatedDate { get; set; }
        public List<string> PurchasedNoteTitles { get; set; } = new List<string>();
    }
}