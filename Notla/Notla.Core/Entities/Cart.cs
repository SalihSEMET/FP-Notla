namespace Notla.Core.Entities
{
    public class Cart : BaseEntity
    {
        public int UserId { get; set; }
        public User User { get; set; }
        public ICollection<CartItem> CartItems { get; set; }
        public Cart()
        {
            CartItems = new HashSet<CartItem>();
        }
    }
}