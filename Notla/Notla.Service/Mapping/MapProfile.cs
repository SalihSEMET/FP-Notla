using AutoMapper;
using Notla.Core.Entities;
using Notla.Core.DTOs;
namespace Notla.Service.Mapping
{
    public class MapProfile : Profile
    {
        public MapProfile()
        {
            CreateMap<Category, CategoryDto>().ReverseMap();
            CreateMap<Note, NoteCreateDto>().ReverseMap();
            CreateMap<Note, NoteUpdateDto>().ReverseMap();
            CreateMap<Note, NoteDto>()
            .ForMember(dest => dest.CoverImageUrl, opt =>
            opt.MapFrom(src => src.Images.Where(x => x.IsCover).Select(x => x.ImageUrl).FirstOrDefault()))
            .ForMember(dest => dest.Rating, opt => opt.MapFrom(src => src.Reviews.Any() ? Math.Round(src.Reviews.Average(r => r.Rating), 1) : 0))
            .ForMember(dest => dest.ReviewCount, opt => opt.MapFrom(src => src.Reviews.Count));
            CreateMap<Note, AdminNoteDto>();
        }
    }
}