namespace Notla.Core.Entities
{
    public class Cart : BaseEntity
    {
        public int UserId { get; set; }
        public User User { get; set; }
        public ICollection<CartItem> CardItems { get; set; }
        public Cart()
        {
            CardItems = new HashSet<CartItem>();
        }
    }
}