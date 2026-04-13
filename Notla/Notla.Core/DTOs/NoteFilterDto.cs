namespace Notla.Core.DTOs
{
    public class NoteFilterDto
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SearchText { get; set; }
        public List<int>? CategoryIds { get; set; } 
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public int? DaysAgo { get; set; } 
        public string? SortBy { get; set; }
    }
}