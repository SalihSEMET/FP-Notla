namespace Notla.Core.Services
{
    public interface INotificationService
    {
        Task SendNotificationToUserAsync(string userId, string message);
    }
}