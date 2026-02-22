using Microsoft.AspNetCore.Http;

namespace Notla.Core.DTOs
{
    public class NoteCreateDto
    {
        public string Title { get; set; }
        public string Content { get; set; }
        public decimal? Price { get; set; }
        public int CategoryId { get; set; }
        public IFormFile CoverImage { get; set; }
        public IFormFile DemoPdf { get; set; }
        public IFormFile OriginalPdf { get; set; }
        public List<IFormFile> SampleImages { get; set; }
    }
}