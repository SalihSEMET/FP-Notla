using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Notla.Core.DTOs;
using Notla.Core.Entities;
using Notla.Core.Services;
using Microsoft.AspNetCore.Authorization;
namespace Notla.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class NotesController : ControllerBase
    {
        private readonly INoteService _noteService;
        private readonly IMapper _mapper;
        public NotesController(INoteService noteService, IMapper mapper)
        {
            _noteService = noteService;
            _mapper = mapper;
        }
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var notes = await _noteService.GetAllAsync();
            var notesDto = _mapper.Map<IEnumerable<NoteDto>>(notes);
            return Ok(notesDto);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var note = await _noteService.GetByIdAsync(id);
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
        public async Task<IActionResult> Save(NoteCreateDto noteCreateDto)
        {
            var noteEntity = _mapper.Map<Note>(noteCreateDto);
            var newNote = await _noteService.AddAsync(noteEntity);
            var newNoteDto = _mapper.Map<NoteDto>(newNote);
            return CreatedAtAction(nameof(GetById), new { id = newNoteDto.Id }, newNoteDto);
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
    }
}