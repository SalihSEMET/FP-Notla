using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Notla.Core.DTOs;
using Notla.Core.Entities;
using Notla.Core.Services;
namespace Notla.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly IService<Category> _categoryservice;
        private readonly IMapper _mapper;
        public CategoriesController(IService<Category> categoryservice, IMapper mapper)
        {
            _categoryservice = categoryservice;
            _mapper = mapper;
        }
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _categoryservice.GetAllAsync();
            var categoriesDto = _mapper.Map<IEnumerable<CategoryDto>>(categories);
            return Ok(categoriesDto);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var category = await _categoryservice.GetByIdAsync(id);
            if (category == null)
            {
                return NotFound();
            }
            var categoryDto = _mapper.Map<CategoryDto>(category);
            return Ok(categoryDto);
        }
        [HttpPost]
        public async Task<IActionResult> Save(CategoryDto categoryDto)
        {
            var categoryEntitiy = _mapper.Map<Category>(categoryDto);
            var newCategory = await _categoryservice.AddAsync(categoryEntitiy);
            var newCategoryDto = _mapper.Map<CategoryDto>(newCategory);
            return CreatedAtAction(nameof(GetById), new { id = newCategoryDto.Id }, newCategoryDto);
        }
        [HttpPut]
        public async Task<IActionResult> Update(CategoryDto categoryDto)
        {
            var categoryEntitiy = _mapper.Map<Category>(categoryDto);
            await _categoryservice.UpdateAsync(categoryEntitiy);
            return NoContent();
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> Remove(int id)
        {
            var category = await _categoryservice.GetByIdAsync(id);
            if (category == null)
            {
                return NotFound();
            }
            await _categoryservice.RemoveAsync(category);
            return NoContent();
        }

    }
}