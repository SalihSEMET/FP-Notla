namespace Notla.Core.DTOs
{
    public class NoteFilterDto
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SearchText { get; set; }
        public int? CategoryId { get; set; }
        public string? SortBy { get; set; }
    }
}