namespace Notla.Core.Exceptions
{
    public class ClientSideException : Exception
    {
        //Missing or Incorrect Data
        public ClientSideException(string message) : base(message)
        {

        }
    }
}