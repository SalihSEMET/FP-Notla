using Notla.Core.UnitOfWork;
using Notla.Repository.Contexts;
using System.Threading.Tasks;
namespace Notla.Repository.UnitOfWork
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext _context;
        public UnitOfWork(AppDbContext context)
        {
            _context = context;
        }
        public void Commit()
        {
            _context.SaveChanges();
        }
        public async Task CommitAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}