using Microsoft.EntityFrameworkCore;
using Notla.Repository.Contexts;
using Notla.Core.Entities;
using Microsoft.AspNetCore.Identity;
using Notla.Core.UnitOfWork;
using Notla.Repository.UnitOfWork;
using Notla.Core.Services;
using Notla.Service.Services;
using System.Reflection;
using Notla.Service.Mapping;
using Notla.Core.Repositories;
using Notla.Repository.Repositories;
using AutoMapper;
using Notla.API.MiddleWares;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Mvc;
using Notla.API.Filters;
using Notla.Service.Validations;
using FluentValidation;
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("SqlConnection"), sqlOptions =>
    {
        sqlOptions.MigrationsAssembly("Notla.Repository");
    });
});
builder.Services.AddIdentity<User, Role>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 3;

    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped(typeof(IService<>), typeof(Service<>));
builder.Services.AddAutoMapper(config =>
{
    config.AddProfile<MapProfile>();
});
builder.Services.AddScoped<INoteService, NoteService>();
builder.Services.AddControllers(options =>
{
    options.Filters.Add(new ValidateFilterAttribute());
});
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.SuppressModelStateInvalidFilter = true;
});
builder.Services.AddFluentValidationAutoValidation()
    .AddValidatorsFromAssemblyContaining<NoteCreateDtoValidator>();
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseCustomException();
app.UseHttpsRedirection();

app.MapControllers();

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
