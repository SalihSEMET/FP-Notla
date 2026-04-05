using Microsoft.AspNetCore.Http;

namespace Notla.Core.DTOs
{
    public class UserUpdateProfileDto
    {
        public string? Bio { get; set; }
        public IFormFile? ProfileImage { get; set; }
    }
}