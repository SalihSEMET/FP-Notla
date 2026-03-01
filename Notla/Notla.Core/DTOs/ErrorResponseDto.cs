using System.Text.Json;
namespace Notla.Core.DTOs
{
    public class ErrorResponseDto
    {
        public int StatusCode { get; set; }
        public string Message { get; set; }
        public override string ToString()
        {
            return JsonSerializer.Serialize(this);
        }
    }
}