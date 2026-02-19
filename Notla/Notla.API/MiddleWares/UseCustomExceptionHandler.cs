using Microsoft.AspNetCore.Diagnostics;
using Notla.Core.Exceptions;
using System.Text.Json;
namespace Notla.API.MiddleWares
{
    public static class UseCustomExceptionHandler
    {
        public static void UseCustomException(this IApplicationBuilder app)
        {
            app.UseExceptionHandler(config =>
            {
                config.Run(async context =>
                {
                    context.Response.ContentType = "application/json";
                    var exceptionsFeature = context.Features.Get<IExceptionHandlerFeature>();
                    if (exceptionsFeature != null)
                    {
                        var statusCode = exceptionsFeature.Error switch
                        {
                            ClientSideException => 400, //User Error
                            NotFoundException => 404, //Not Found Error
                            _ => 500 //Remaining Errors
                        };

                        context.Response.StatusCode = statusCode;
                        var response = new
                        {
                            StatusCode = statusCode,
                            Message = exceptionsFeature.Error.Message
                        };
                        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
                    }
                });
            });
        }
    }
}