namespace Notla.Core.Entities
{
    public class SellerProfile : BaseEntity
    {
        public string UserId { get; set; }
        public User User { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string University { get; set; }
        public string Department { get; set; }
        public string Iban { get; set; }
        public bool IsApproved { get; set; } = false;
    }
}