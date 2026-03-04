using Microsoft.AspNetCore.SignalR;
namespace Notla.API.Hubs
{
    public class NotificationHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            Console.WriteLine($"A client has connected: {Context.ConnectionId}");
            await base.OnConnectedAsync();
        }
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            Console.WriteLine($"A client has left: {Context.ConnectionId}");
            await base.OnDisconnectedAsync(exception);
        }
    }
}