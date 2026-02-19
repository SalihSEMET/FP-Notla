using FluentValidation;
using Notla.Core.DTOs;
namespace Notla.Service.Validations
{
    public class NoteCreateDtoValidator : AbstractValidator<NoteCreateDto>
    {
        public NoteCreateDtoValidator()
        {
            RuleFor(x => x.Title)
            .NotEmpty().WithMessage("The note title cannot be left blank.")
            .NotNull().WithMessage("Note Heading is Required.")
            .MaximumLength(100).WithMessage("The title can be a maximum of 100 characters.");
            RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Note content cannot be left blank.");
            RuleFor(x => x.CategoryId)
            .GreaterThan(0).WithMessage("You must select a valid category.");
            RuleFor(x => x.Price)
            .GreaterThan(0).When(x => x.Price.HasValue).WithMessage("The price must be greater than 0.");
        }
    }
}