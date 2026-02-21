using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Notla.Core.Services;

namespace Notla.Service.Services
{
    public class LocalStorageService : IStorageService
    {
        private readonly IHostEnvironment _env;

        public LocalStorageService(IHostEnvironment env)
        {
            _env = env;
        }

        public async Task<string> UploadFileAsync(string folderName, IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("The file cannot be empty.");

            var extension = Path.GetExtension(file.FileName);
            var uniqueFileName = $"{Guid.NewGuid()}{extension}";

            var uploadPath = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads", folderName);

            if (!Directory.Exists(uploadPath))
            {
                Directory.CreateDirectory(uploadPath);
            }

            var filePath = Path.Combine(uploadPath, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return $"/uploads/{folderName}/{uniqueFileName}";
        }

        public void Delete(string folderName, string fileName)
        {
            var filePath = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads", folderName, fileName);

            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }
        }
    }
}