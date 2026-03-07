import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-blue-600 p-4 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {}
        <Link to="/" className="text-2xl font-bold tracking-wider">
          NOTLA.
        </Link>
        
        {}
        <div className="space-x-6">
          <Link to="/" className="hover:text-blue-200 transition">Main Pages</Link>
          <Link to="/login" className="hover:text-blue-200 transition">Log in</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;