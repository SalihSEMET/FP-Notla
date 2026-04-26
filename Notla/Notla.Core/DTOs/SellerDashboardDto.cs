namespace Notla.Core.DTOs
{
    public class SellerDashboardDto
    {
        public decimal TotalEarnings { get; set; }
        public int TotalSales { get; set; }
        public int ActiveNotesCount { get; set; }
        public int TotalViews { get; set; }
    }
}