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
            opt.MapFrom(src => src.Images.Where(x => x.IsCover).Select(x => x.ImageUrl).FirstOrDefault()));
        }
    }
}