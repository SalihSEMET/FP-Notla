import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NoteCard from '../components/NoteCard';

function ForYouPage() {
  const navigate = useNavigate();
  const backendUrl = "http://localhost:5261";

  const [rawFeedData, setRawFeedData] = useState([]);
  const [filteredFeedData, setFilteredFeedData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    searchText: "",
    categoryIds: [],
    minPrice: "",
    maxPrice: "",
    daysAgo: "",
    sortBy: "newest"
  });

  const [searchInput, setSearchInput] = useState("");
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchFeed();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, rawFeedData]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/Categories`);
      setCategories(response.data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  const fetchFeed = async () => {
    const token = localStorage.getItem("notla_token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const followingRes = await axios.get(`${backendUrl}/api/Follower/MyFollowing`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const followedUsers = followingRes.data;

      if (followedUsers.length === 0) {
        setLoading(false);
        return;
      }

      const notesRes = await axios.get(`${backendUrl}/api/Notes`);
      const allActiveNotes = notesRes.data;

      const groupedFeed = followedUsers.map(user => {
        const userNotes = allActiveNotes.filter(note => note.sellerId === user.userId);
        return {
          sellerInfo: user,
          notes: userNotes
        };
      }).filter(group => group.notes.length > 0);

      setRawFeedData(groupedFeed);
      setLoading(false);
      
    } catch (err) {
      console.error(err);
      setError("Failed to load your feed.");
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filteredGroups = [];

    rawFeedData.forEach(group => {
      let filteredNotes = [...group.notes];

      if (filters.searchText) {
        const lowerSearch = filters.searchText.toLowerCase();
        filteredNotes = filteredNotes.filter(n => 
          n.title?.toLowerCase().includes(lowerSearch) || 
          n.content?.toLowerCase().includes(lowerSearch)
        );
      }

      if (filters.categoryIds.length > 0) {
        filteredNotes = filteredNotes.filter(n => filters.categoryIds.includes(n.categoryId));
      }

      if (filters.minPrice) {
        filteredNotes = filteredNotes.filter(n => n.price >= parseFloat(filters.minPrice));
      }

      if (filters.maxPrice) {
        filteredNotes = filteredNotes.filter(n => n.price <= parseFloat(filters.maxPrice));
      }

      if (filters.daysAgo) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() - parseInt(filters.daysAgo));
        filteredNotes = filteredNotes.filter(n => new Date(n.createdDate || Date.now()) >= targetDate);
      }

      if (filters.sortBy) {
        filteredNotes.sort((a, b) => {
          if (filters.sortBy === 'price_asc') return a.price - b.price;
          if (filters.sortBy === 'price_desc') return b.price - a.price;
          if (filters.sortBy === 'rating_desc') return (b.rating || 0) - (a.rating || 0);
          if (filters.sortBy === 'newest') return new Date(b.createdDate || 0) - new Date(a.createdDate || 0);
          return 0;
        });
      }

      if (filteredNotes.length > 0) {
        filteredGroups.push({ ...group, notes: filteredNotes });
      }
    });

    setFilteredFeedData(filteredGroups);
  };

  const handleCategoryChange = (categoryId) => {
    setFilters(prev => {
      const newCategoryIds = prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...prev.categoryIds, categoryId];
      return { ...prev, categoryIds: newCategoryIds };
    });
  };

  const handleApplyPrice = () => {
    setFilters(prev => ({
      ...prev,
      minPrice: minPriceInput,
      maxPrice: maxPriceInput
    }));
  };

  const handleDateChange = (days) => {
    setFilters(prev => ({ ...prev, daysAgo: days }));
  };

  const handleSortChange = (e) => {
    setFilters(prev => ({ ...prev, sortBy: e.target.value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, searchText: searchInput }));
  };

  const clearFilters = () => {
    setFilters({
      searchText: "",
      categoryIds: [],
      minPrice: "",
      maxPrice: "",
      daysAgo: "",
      sortBy: "newest"
    });
    setSearchInput("");
    setMinPriceInput("");
    setMaxPriceInput("");
  };

  const filterContent = (
    <div className="space-y-8">
      <div>
        <h3 className="font-black text-gray-800 mb-4 uppercase tracking-wider text-sm">Categories</h3>
        <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {categories.map(cat => (
            <label key={cat.id} className="flex items-center space-x-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={filters.categoryIds.includes(cat.id)}
                onChange={() => handleCategoryChange(cat.id)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-gray-700 font-medium group-hover:text-blue-600 transition-colors">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h3 className="font-black text-gray-800 mb-4 uppercase tracking-wider text-sm">Price Range</h3>
        <div className="flex items-center gap-2">
          <input 
            type="number" 
            placeholder="Min" 
            value={minPriceInput}
            onChange={(e) => setMinPriceInput(e.target.value)}
            className="w-full min-w-0 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <span className="text-gray-400 font-bold">-</span>
          <input 
            type="number" 
            placeholder="Max" 
            value={maxPriceInput}
            onChange={(e) => setMaxPriceInput(e.target.value)}
            className="w-full min-w-0 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button 
            onClick={handleApplyPrice}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors shadow-sm shrink-0"
          >
            ➔
          </button>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h3 className="font-black text-gray-800 mb-4 uppercase tracking-wider text-sm">Published</h3>
        <div className="space-y-3">
          {[
            { label: 'All Time', value: '' },
            { label: 'Last 24 Hours', value: '1' },
            { label: 'Last 7 Days', value: '7' },
            { label: 'Last 30 Days', value: '30' }
          ].map(option => (
            <label key={option.value} className="flex items-center space-x-3 cursor-pointer group">
              <input 
                type="radio" 
                name="dateFilter"
                checked={String(filters.daysAgo) === option.value}
                onChange={() => handleDateChange(option.value)}
                className="w-5 h-5 border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-gray-700 font-medium group-hover:text-blue-600 transition-colors">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <button 
        onClick={clearFilters}
        className="w-full py-3 mt-4 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 font-bold rounded-xl transition-colors border border-gray-200 hover:border-red-200"
      >
        Clear All Filters
      </button>
    </div>
  );

  if (loading) return <div className="text-center py-20 text-2xl font-bold text-blue-500 animate-pulse">Curating your feed...</div>;
  if (error) return <div className="text-center py-20 text-2xl text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 relative min-h-screen">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">For You ✨</h1>
        <p className="text-gray-500 text-lg font-medium">Latest notes from the sellers you follow.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        <div className="hidden lg:block w-1/4 xl:w-1/5 shrink-0">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-6">
            {filterContent}
          </div>
        </div>

        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden flex">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)}></div>
            <div className="w-4/5 max-w-sm bg-white h-full shadow-2xl relative flex flex-col z-10 transform transition-transform overflow-y-auto">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-black text-gray-900">Filters</h2>
                <button onClick={() => setIsMobileFilterOpen(false)} className="text-gray-400 hover:text-red-500 text-2xl font-bold">✕</button>
              </div>
              <div className="p-6 flex-1">
                {filterContent}
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col min-h-0">
          
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 gap-4">
            <button 
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden w-full sm:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <span>⚙️</span> Filters
            </button>

            <form onSubmit={handleSearchSubmit} className="w-full sm:max-w-md relative">
              <input 
                type="text" 
                placeholder="Search within your feed..." 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-5 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-xl hover:scale-110 transition-transform">🔍</button>
            </form>

            <div className="w-full sm:w-auto flex items-center gap-3">
              <span className="text-sm font-bold text-gray-500 hidden md:block uppercase">Sort by:</span>
              <select 
                value={filters.sortBy}
                onChange={handleSortChange}
                className="w-full sm:w-auto bg-gray-50 border border-gray-200 text-gray-800 font-bold py-3 px-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="rating_desc">Highest Rated</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {rawFeedData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
              <span className="text-6xl mb-4 block">👀</span>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Your feed is a bit empty.</h2>
              <p className="text-gray-500 mb-6 text-center max-w-md">The sellers you follow haven't posted any notes yet, or you aren't following anyone who sells notes.</p>
              <button 
                onClick={() => navigate('/')}
                className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition-colors"
              >
                Explore Marketplace
              </button>
            </div>
          ) : filteredFeedData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
              <span className="text-6xl mb-4 block">📭</span>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No matches in your feed.</h2>
              <p className="text-gray-500">Try adjusting your filters or searching for a different keyword.</p>
              <button 
                onClick={clearFilters}
                className="mt-6 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="space-y-12">
              {filteredFeedData.map(group => (
                <div key={group.sellerInfo.userId} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div 
                    onClick={() => navigate(`/seller/${group.sellerInfo.userId}`)}
                    className="flex items-center gap-4 mb-6 cursor-pointer group w-max"
                  >
                    <img 
                      src={group.sellerInfo.profileImageUrl ? `${backendUrl}${group.sellerInfo.profileImageUrl}` : "https://placehold.co/100x100/e2e8f0/475569?text=U"}
                      alt={group.sellerInfo.userName}
                      className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 shadow-sm group-hover:border-blue-400 transition-colors"
                    />
                    <div>
                      <h3 className="font-black text-xl text-gray-900 group-hover:text-blue-600 transition-colors">
                        @{group.sellerInfo.userName}
                      </h3>
                      <p className="text-sm text-gray-500 font-medium">Showing {group.notes.length} notes</p>
                    </div>
                  </div>

                  <div className="flex overflow-x-auto pb-6 pt-2 gap-6 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {group.notes.map(note => (
                      <div key={note.id} className="min-w-[280px] max-w-[300px] snap-start flex-shrink-0">
                        <NoteCard note={note} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForYouPage;