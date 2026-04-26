import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import NoteDetailPage from './pages/NoteDetailPage';
import CartPage from './pages/CartPage';
import LibraryPage from './pages/LibraryPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import SellNotePage from './pages/SellNotePage';
import AdminPanelPage from './pages/AdminPanelPage';
import PublicSellerProfile from './pages/PublicSellerProfile';
import FavoritesPage from './pages/FavoritesPage';
import ForYouPage from './pages/ForYouPage';
import AdminCategoryPage from './pages/AdminCategoryPage';
import SellerDashboardPage from './pages/SellerDashboardPage';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/note/:id" element={<NoteDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/sell-note" element={<SellNotePage />} />
          <Route path="/admin" element={<AdminPanelPage />} />
          <Route path="/seller/:id" element={<PublicSellerProfile />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/foryou" element={<ForYouPage />} />
          <Route path="/admin/categories" element={<AdminCategoryPage />} />
          <Route path="/dashboard" element={<SellerDashboardPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;