using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Notla.Core.DTOs;
using Notla.Core.Entities;
using Notla.Core.Services;
using System.Security.Claims;
using AutoMapper;
using Microsoft.EntityFrameworkCore.Metadata;
namespace Notla.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class NotesController : ControllerBase
    {
        private readonly INoteService _noteService;
        private readonly IStorageService _storageService;
        private readonly IMapper _mapper;
        public NotesController(INoteService noteService, IMapper mapper, IStorageService storageService)
        {
            _noteService = noteService;
            _mapper = mapper;
            _storageService = storageService;
        }
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var notesDtos = await _noteService.GetNotesWithImagesAsync();
            return Ok(notesDtos);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var note = await _noteService.GetNoteWithCategoryByIdAsync(id);
            var noteDto = _mapper.Map<NoteDto>(note);
            return Ok(noteDto);
        }
        [HttpGet("getwithcategory/{id}")]
        public async Task<IActionResult> GetWithCategoryById(int id)
        {
            var noteDto = await _noteService.GetNoteWithCategoryByIdAsync(id);
            return Ok(noteDto);
        }
        [HttpPost]
        public async Task<IActionResult> CreateNote([FromForm] NoteCreateDto noteDto)
        {
            if (noteDto.SampleImages != null && noteDto.SampleImages.Count > 15)
            {
                return BadRequest("You can upload a maximum of 15 sample photos.");
            }
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
            int sellerId = int.Parse(userIdString);
            string coverImagePath = await _storageService.UploadFileAsync("images", noteDto.CoverImage);
            string demoPdfPath = await _storageService.UploadFileAsync("pdfs", noteDto.DemoPdf);
            string originalPdfPath = await _storageService.UploadFileAsync("pdfs", noteDto.OriginalPdf);
            var newNote = new Note
            {
                Title = noteDto.Title,
                Content = noteDto.Content,
                Price = noteDto.Price,
                CategoryId = noteDto.CategoryId,
                SellerId = sellerId,
                DemoPdfUrl = demoPdfPath,
                OriginalPdfUrl = originalPdfPath,
                Images = new List<NoteImage>()
            };
            newNote.Images.Add(new NoteImage
            {
                ImageUrl = coverImagePath,
                IsCover = true
            });
            if (noteDto.SampleImages != null && noteDto.SampleImages.Any())
            {
                foreach (var sampleImage in noteDto.SampleImages)
                {
                    string samplePath = await _storageService.UploadFileAsync("images", sampleImage);
                    newNote.Images.Add(new NoteImage
                    {
                        ImageUrl = samplePath,
                        IsCover = false
                    });
                }
            }
            await _noteService.AddAsync(newNote);
            return StatusCode(201, "The note was successfully put up for sale and the files were uploaded!");
        }
        [HttpPut]
        public async Task<IActionResult> Update(NoteUpdateDto noteUpdateDto)
        {
            await _noteService.GetByIdAsync(noteUpdateDto.Id);
            var noteEntity = _mapper.Map<Note>(noteUpdateDto);
            await _noteService.UpdateAsync(noteEntity);
            return NoContent();
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> Remove(int id)
        {
            var note = await _noteService.GetByIdAsync(id);
            await _noteService.RemoveAsync(note);
            return NoContent();
        }
        [HttpGet("Filter")]
        public async Task<IActionResult> GetFilteredNotes([FromQuery] NoteFilterDto filterDto)
        {
            var result = await _noteService.GetFilteredAndPagedNotesAsync(filterDto);
            return Ok(result);
        }
    }
}