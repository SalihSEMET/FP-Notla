import { useState, useEffect } from 'react';
import axios from 'axios';
import NoteCard from '../components/NoteCard';

function HomePage() {
  const backendUrl = "http://localhost:5261";

  const [notes, setNotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const [filters, setFilters] = useState({
    pageNumber: 1,
    pageSize: 12,
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
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/Categories`);
      setCategories(response.data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('PageNumber', filters.pageNumber);
      params.append('PageSize', filters.pageSize);
      if (filters.searchText) params.append('SearchText', filters.searchText);
      if (filters.minPrice) params.append('MinPrice', filters.minPrice);
      if (filters.maxPrice) params.append('MaxPrice', filters.maxPrice);
      if (filters.daysAgo) params.append('DaysAgo', filters.daysAgo);
      if (filters.sortBy) params.append('SortBy', filters.sortBy);
      
      filters.categoryIds.forEach(id => {
        params.append('CategoryIds', id);
      });

      const response = await axios.get(`${backendUrl}/api/Notes/Filter?${params.toString()}`);
      setNotes(response.data.items);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error("Failed to fetch notes", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setFilters(prev => {
      const newCategoryIds = prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...prev.categoryIds, categoryId];
      return { ...prev, categoryIds: newCategoryIds, pageNumber: 1 };
    });
  };

  const handleApplyPrice = () => {
    setFilters(prev => ({
      ...prev,
      minPrice: minPriceInput,
      maxPrice: maxPriceInput,
      pageNumber: 1
    }));
  };

  const handleDateChange = (days) => {
    setFilters(prev => ({ ...prev, daysAgo: days, pageNumber: 1 }));
  };

  const handleSortChange = (e) => {
    setFilters(prev => ({ ...prev, sortBy: e.target.value, pageNumber: 1 }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, searchText: searchInput, pageNumber: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      pageNumber: 1,
      pageSize: 12,
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

  const totalPages = Math.ceil(totalCount / filters.pageSize);

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

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 relative min-h-screen">
      
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Discover Notes 🚀</h1>
        <p className="text-gray-500 text-lg font-medium">Explore the best academic and professional resources.</p>
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
                placeholder="Search for notes, subjects, or keywords..." 
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

          {loading ? (
            <div className="flex-1 flex items-center justify-center py-20">
              <div className="text-2xl font-bold text-blue-500 animate-pulse flex items-center gap-3">
                <span className="text-4xl">📚</span> Loading Marketplace...
              </div>
            </div>
          ) : notes.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
              <span className="text-6xl mb-4 block">📭</span>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No notes found.</h2>
              <p className="text-gray-500">Try adjusting your filters or searching for a different keyword.</p>
              <button 
                onClick={clearFilters}
                className="mt-6 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {notes.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-auto flex justify-center items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <button 
                    disabled={filters.pageNumber === 1}
                    onClick={() => setFilters(prev => ({ ...prev, pageNumber: prev.pageNumber - 1 }))}
                    className={`px-5 py-2.5 rounded-xl font-bold transition-all ${filters.pageNumber === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'}`}
                  >
                    &larr; Prev
                  </button>
                  
                  <span className="font-bold text-gray-600">
                    Page <span className="text-blue-600">{filters.pageNumber}</span> of {totalPages}
                  </span>

                  <button 
                    disabled={filters.pageNumber === totalPages}
                    onClick={() => setFilters(prev => ({ ...prev, pageNumber: prev.pageNumber + 1 }))}
                    className={`px-5 py-2.5 rounded-xl font-bold transition-all ${filters.pageNumber === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'}`}
                  >
                    Next &rarr;
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;