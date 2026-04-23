using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Notla.Core.DTOs;
using Notla.Core.Entities;
using Notla.Core.Services;
using System.Security.Claims;
using AutoMapper;
using Microsoft.AspNetCore.Identity;

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
        private readonly UserManager<User> _userManager;
        private readonly IEmailService _emailService;

        public NotesController(INoteService noteService, IMapper mapper, IStorageService storageService, UserManager<User> userManager, IEmailService emailService)
        {
            _noteService = noteService;
            _mapper = mapper;
            _storageService = storageService;
            _userManager = userManager;
            _emailService = emailService;
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var notesDtos = await _noteService.GetNotesWithImagesAsync();
            return Ok(notesDtos);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
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
        [DisableRequestSizeLimit]
        [RequestFormLimits(ValueLengthLimit = int.MaxValue, MultipartBodyLengthLimit = int.MaxValue)]
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
            string originalPdfPath = await _storageService.UploadFileAsync("pdfs", noteDto.OriginalPdf);
            string demoPdfPath = null;

            if (noteDto.DemoPdf != null)
            {
                demoPdfPath = await _storageService.UploadFileAsync("pdfs", noteDto.DemoPdf);
            }

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

            var seller = await _userManager.FindByIdAsync(sellerId.ToString());
            if (seller != null)
            {
                string subject = "Your Note is Under Review";
                string body = $@"
                    <h2>Hello {seller.UserName},</h2>
                    <p>Your note titled <b>'{newNote.Title}'</b> has been successfully uploaded.</p>
                    <p>It is currently being reviewed by our moderation team. You will be notified via email once it is approved and published on the marketplace.</p>
                    <br/>
                    <p><b>Team Notla</b></p>";
                await _emailService.SendEmailAsync(seller.Email, subject, body);
            }

            return StatusCode(201, "The note was successfully put up for sale and the files were uploaded!");
        }

        [HttpPut]
        public async Task<IActionResult> Update(NoteUpdateDto noteUpdateDto)
        {
            var existingNote = await _noteService.GetByIdAsync(noteUpdateDto.Id);
            _mapper.Map(noteUpdateDto, existingNote);
            await _noteService.UpdateAsync(existingNote);
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
        [AllowAnonymous]
        public async Task<IActionResult> GetFilteredNotes([FromQuery] NoteFilterDto filterDto)
        {
            var result = await _noteService.GetFilteredAndPagedNotesAsync(filterDto);
            return Ok(result);
        }

        [HttpGet("Trending")]
        [AllowAnonymous]
        public async Task<IActionResult> GetTrendingNotes()
        {
            var trendingNotes = await _noteService.GetTrendingNotesAsync(10);
            return Ok(trendingNotes);
        }

        [Authorize]
        [HttpGet("MySellingNotes")]
        public async Task<IActionResult> GetMySellingNotes()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

            int sellerId = int.Parse(userIdString);
            var notes = await _noteService.GetMySellingNotesAsync(sellerId);
            return Ok(notes);
        }
    }
}