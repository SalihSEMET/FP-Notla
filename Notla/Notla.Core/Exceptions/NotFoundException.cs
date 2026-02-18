namespace Notla.Core.Exceptions
{
    public class NotFoundException : Exception
    {
        //No data found.
        public NotFoundException(string message) : base(message)
        {

        }
    }
}