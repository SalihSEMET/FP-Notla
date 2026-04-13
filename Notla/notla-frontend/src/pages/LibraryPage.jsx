import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function LibraryPage() {
  const [rawLibrary, setRawLibrary] = useState([]);
  const [library, setLibrary] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const [reviewModal, setReviewModal] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  const [favorites, setFavorites] = useState([]);

  const [filters, setFilters] = useState({
    searchText: "",
    categoryIds: [],
    daysAgo: ""
  });

  const [searchInput, setSearchInput] = useState("");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const navigate = useNavigate();
  const backendUrl = "http://localhost:5261";

  useEffect(() => {
    fetchCategories();
    fetchLibrary();
    fetchFavorites();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, rawLibrary]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/Categories`);
      setCategories(response.data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  const fetchLibrary = async () => {
    const token = localStorage.getItem("notla_token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get(`${backendUrl}/api/Orders/MyLibrary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRawLibrary(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load your library.");
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    const token = localStorage.getItem("notla_token");
    if (!token) return;

    try {
        const response = await axios.get(`${backendUrl}/api/UserFavorites/MyFavorites`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setFavorites(response.data.map(f => f.noteId));
    } catch (err) {
        console.error(err);
    }
  };

  const applyFilters = () => {
    let result = [...rawLibrary];

    if (filters.searchText) {
      const lowerSearch = filters.searchText.toLowerCase();
      result = result.filter(item => item.title?.toLowerCase().includes(lowerSearch));
    }

    if (filters.categoryIds.length > 0) {
      result = result.filter(item => filters.categoryIds.includes(item.categoryId));
    }

    if (filters.daysAgo) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - parseInt(filters.daysAgo));
      result = result.filter(item => new Date(item.createdDate || Date.now()) >= targetDate);
    }

    setLibrary(result);
  };

  const handleCategoryChange = (categoryId) => {
    setFilters(prev => {
      const newCategoryIds = prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...prev.categoryIds, categoryId];
      return { ...prev, categoryIds: newCategoryIds };
    });
  };

  const handleDateChange = (days) => {
    setFilters(prev => ({ ...prev, daysAgo: days }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, searchText: searchInput }));
  };

  const clearFilters = () => {
    setFilters({
      searchText: "",
      categoryIds: [],
      daysAgo: ""
    });
    setSearchInput("");
  };

  const handleToggleFavorite = async (noteId) => {
    const token = localStorage.getItem("notla_token");
    if (!token) return;

    try {
        const response = await axios.post(`${backendUrl}/api/UserFavorites/Toggle/${noteId}`, null, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if(response.data.isFavorite) {
            setFavorites(prev => [...prev, noteId]);
        } else {
            setFavorites(prev => prev.filter(id => id !== noteId));
        }
    } catch (err) {
        console.error(err);
    }
  };

  const handleDownload = async (pdfUrl, title, noteId) => {
    setDownloadingId(noteId);
    try {
      const response = await axios.get(`${backendUrl}${pdfUrl}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${title.replace(/\s+/g, '_')}_Original.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      alert("Failed to download the PDF file. It might be missing on the server.");
    } finally {
      setDownloadingId(null);
    }
  };

  const submitReview = async () => {
    if (rating < 1 || rating > 5) return;
    setIsSubmittingReview(true);
    setReviewMessage("");

    const token = localStorage.getItem("notla_token");
    try {
      await axios.post(`${backendUrl}/api/NoteReviews`, {
        noteId: reviewModal.noteId,
        rating: rating,
        comment: comment.trim() !== "" ? comment.trim() : null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setReviewMessage("✅ Review submitted successfully!");
      setTimeout(() => {
        setReviewModal(null);
        setRating(0);
        setComment("");
        setReviewMessage("");
      }, 2000);
    } catch (err) {
      const msg = err.response?.data?.Message || err.response?.data || "Failed to submit review.";
      setReviewMessage(`❌ ${msg}`);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getPdfUrlForReading = async (noteId) => {
      try {
          const token = localStorage.getItem("notla_token");
          const libRes = await axios.get(`${backendUrl}/api/Orders/MyLibrary`, { headers: { Authorization: `Bearer ${token}` } });
          const noteData = libRes.data.find(n => n.noteId === noteId);
          if(noteData && noteData.originalPdfUrl) {
              setSelectedPdf(noteData.originalPdfUrl);
          } else {
              alert("PDF could not be found.");
          }
      } catch (err) {
          alert("Error opening PDF.");
      }
  }

  const FilterContent = () => (
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
        <h3 className="font-black text-gray-800 mb-4 uppercase tracking-wider text-sm">Purchased</h3>
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

  if (loading) return <div className="text-center py-20 text-2xl font-bold text-blue-500 animate-pulse">Loading Your Library...</div>;
  if (error) return <div className="text-center py-20 text-2xl text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 relative min-h-screen">
      
      <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
        <div>
            <h1 className="text-3xl font-extrabold text-gray-900">My Library</h1>
            <p className="text-gray-500 font-medium mt-1">Manage and read your purchased notes.</p>
        </div>
        <span className="bg-blue-100 text-blue-800 font-bold px-4 py-2 rounded-lg">
          {rawLibrary.length} Notes Owned
        </span>
      </div>

      {rawLibrary.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your library is currently empty.</h2>
          <p className="text-gray-500 mb-8">Start exploring the marketplace to add some valuable notes here!</p>
          <Link to="/" className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition-colors">
            Explore Notes
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          
          <div className="hidden lg:block w-1/4 xl:w-1/5 shrink-0">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-6">
              <FilterContent />
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
                  <FilterContent />
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

              <form onSubmit={handleSearchSubmit} className="w-full relative">
                <input 
                  type="text" 
                  placeholder="Search in your library..." 
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-5 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-xl hover:scale-110 transition-transform">🔍</button>
              </form>
            </div>

            {library.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                <span className="text-6xl mb-4 block">📭</span>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">No items match your filters.</h2>
                <p className="text-gray-500">Try adjusting your filters or searching for a different keyword.</p>
                <button 
                  onClick={clearFilters}
                  className="mt-6 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {library.map((item) => (
                  <div key={item.noteId} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden flex flex-col hover:shadow-xl transition-shadow relative">
                    
                    <button 
                        onClick={(e) => { e.preventDefault(); handleToggleFavorite(item.noteId); }}
                        className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm border border-gray-100 hover:scale-110 transition-all z-10"
                        title={favorites.includes(item.noteId) ? "Remove from Favorites" : "Add to Favorites"}
                    >
                        <span className={`text-xl ${favorites.includes(item.noteId) ? 'text-rose-500' : 'text-gray-300'}`}>
                            {favorites.includes(item.noteId) ? '❤️' : '🤍'}
                        </span>
                    </button>

                    <div className="h-56 bg-gray-50 relative border-b border-gray-100 p-4 flex items-center justify-center cursor-pointer" onClick={() => navigate(`/note/${item.noteId}`)}>
                      <img
                        src={item.coverImageUrl ? `${backendUrl}${item.coverImageUrl}` : "https://placehold.co/300x400/e2e8f0/475569?text=Note+Cover"}
                        alt={item.title}
                        className="max-h-full object-contain drop-shadow-md hover:scale-105 transition-transform"
                      />
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors" title={item.title} onClick={() => navigate(`/note/${item.noteId}`)}>
                        {item.title}
                      </h3>

                      <div className="mt-auto space-y-3">
                        {item.originalPdfUrl ? (
                          <>
                            <button
                              onClick={() => setSelectedPdf(item.originalPdfUrl)}
                              className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2"
                            >
                              <span>👁️</span> Read Online
                            </button>
                            <button
                              onClick={() => handleDownload(item.originalPdfUrl, item.title, item.noteId)}
                              disabled={downloadingId === item.noteId}
                              className={`w-full text-white font-bold py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2 ${downloadingId === item.noteId ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                            >
                              <span>⬇️</span> {downloadingId === item.noteId ? "Downloading..." : "Download"}
                            </button>
                            <button
                              onClick={() => { setReviewModal(item); setRating(0); setComment(""); setReviewMessage(""); }}
                              className="w-full bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-bold py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2 border border-yellow-200"
                            >
                              <span>⭐</span> Rate & Review
                            </button>
                          </>
                        ) : (
                          <div className="text-center py-2 bg-red-50 text-red-600 font-bold rounded-lg border border-red-100">
                            PDF File Missing
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {selectedPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden shadow-2xl relative">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">Reading Mode</h2>
              <button
                onClick={() => setSelectedPdf(null)}
                className="text-gray-500 hover:text-red-600 font-bold text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 w-full h-full bg-gray-200">
              <iframe
                src={`${backendUrl}${selectedPdf}#toolbar=0`}
                className="w-full h-full border-0"
                title="PDF Reader"
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800 line-clamp-1">Review: {reviewModal.title}</h2>
              <button onClick={() => setReviewModal(null)} className="text-gray-500 hover:text-red-600 font-bold text-xl">✕</button>
            </div>
            <div className="p-6">
              <div className="flex justify-center mb-6 space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="text-4xl focus:outline-none transition-transform hover:scale-110"
                  >
                    <span className={(hoverRating || rating) >= star ? "text-yellow-400 drop-shadow-md" : "text-gray-200"}>★</span>
                  </button>
                ))}
              </div>
              
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your review here (optional)..."
                className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none resize-none h-32 mb-4"
              ></textarea>

              {reviewMessage && (
                <div className={`mb-4 text-center p-3 rounded-lg font-bold text-sm ${reviewMessage.includes("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {reviewMessage}
                </div>
              )}

              <button
                onClick={submitReview}
                disabled={rating === 0 || isSubmittingReview}
                className={`w-full font-bold py-3 rounded-xl transition-colors shadow-md text-white ${rating === 0 || isSubmittingReview ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {isSubmittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LibraryPage;