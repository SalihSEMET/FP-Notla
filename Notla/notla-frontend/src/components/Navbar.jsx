import { Link, useLocation } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

function Navbar() {
  const token = localStorage.getItem("notla_token");
  const location = useLocation();
  let userName = null;
  let isAdmin = false;

  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      userName = decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || "User";
      
      const roleClaim = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      if (roleClaim === "Admin" || (Array.isArray(roleClaim) && roleClaim.includes("Admin"))) {
        isAdmin = true;
      }
    } catch (error) {
      localStorage.removeItem("notla_token");
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("notla_token");
    window.location.href = "/login";
  };

  return (
    <nav className="bg-blue-600 p-4 text-white shadow-md relative z-50">
      <div className="container mx-auto flex justify-between items-center">
        
        <Link to="/" className="text-2xl font-black tracking-wider hover:text-blue-200 transition">
          NOTLA.
        </Link>

        <div className="flex items-center space-x-6">
          <Link 
            to="/" 
            className={`font-semibold transition ${location.pathname === '/' ? 'text-blue-200 border-b-2 border-blue-200 pb-1' : 'hover:text-blue-200'}`}
          >
            Home
          </Link>
          
          {userName && (
            <Link 
              to="/foryou" 
              className={`font-semibold transition ${location.pathname === '/foryou' ? 'text-blue-200 border-b-2 border-blue-200 pb-1' : 'hover:text-blue-200'}`}
            >
              For You
            </Link>
          )}

          {userName ? (
            <div className="flex items-center space-x-4">
              <Link to="/cart" className="flex items-center space-x-1 hover:text-blue-200 transition ml-4">
                <span className="text-xl">🛒</span>
                <span className="font-semibold">Cart</span>
              </Link>

              <div className="relative group cursor-pointer py-2">
                <div className="flex items-center space-x-2 bg-blue-700 px-4 py-2 rounded-lg border border-blue-500 hover:bg-blue-800 transition-colors">
                  <span className="text-xl">👤</span>
                  <span className="font-bold tracking-wide">{userName}</span>
                </div>

                <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col">
                  
                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      className="w-full text-left px-5 py-3 text-slate-800 font-bold hover:bg-slate-100 flex items-center space-x-2 transition-colors border-b border-gray-100 bg-slate-50"
                    >
                      <span>🛡️</span>
                      <span>Admin Panel</span>
                    </Link>
                  )}

                  <Link 
                    to="/sell-note" 
                    className="w-full text-left px-5 py-3 text-green-700 font-bold hover:bg-green-50 flex items-center space-x-2 transition-colors border-b border-gray-100"
                  >
                    <span>💸</span>
                    <span>Sell Note</span>
                  </Link>

                  <Link 
                    to="/library" 
                    className="w-full text-left px-5 py-3 text-gray-800 font-bold hover:bg-gray-50 flex items-center space-x-2 transition-colors border-b border-gray-100"
                  >
                    <span>📚</span>
                    <span>My Library</span>
                  </Link>

                  <Link 
                    to="/profile" 
                    className="w-full text-left px-5 py-3 text-gray-800 font-bold hover:bg-gray-50 flex items-center space-x-2 transition-colors border-b border-gray-100"
                  >
                    <span>👤</span>
                    <span>My Profile</span>
                  </Link>

                  <Link 
                    to="/favorites" 
                    className="w-full text-left px-5 py-3 text-rose-600 font-bold hover:bg-rose-50 flex items-center space-x-2 transition-colors border-b border-gray-100"
                  >
                    <span>❤️</span>
                    <span>My Favorites</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-5 py-3 text-red-600 font-bold hover:bg-red-50 flex items-center space-x-2 transition-colors"
                  >
                    <span>🚪</span>
                    <span>Log Out</span>
                  </button>

                </div>
              </div>
            </div>
          ) : (
            <Link to="/login" className="bg-white text-blue-600 font-bold px-6 py-2 rounded-lg hover:bg-blue-50 transition shadow-sm ml-4">
              Log In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;