using Microsoft.AspNetCore.Http;
namespace Notla.Core.Services
{
    public interface IStorageService
    {
        Task<string> UploadFileAsync(string folderName, IFormFile file);
        void Delete(string folderName, string fileName);
    }
}