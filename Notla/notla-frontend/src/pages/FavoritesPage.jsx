import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [libraryIds, setLibraryIds] = useState([]);
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

  const navigate = useNavigate();
  const backendUrl = "http://localhost:5261";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("notla_token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const [favRes, libRes] = await Promise.all([
        axios.get(`${backendUrl}/api/UserFavorites/MyFavorites`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${backendUrl}/api/Orders/MyLibrary`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setFavorites(favRes.data);
      setLibraryIds(libRes.data.map(item => item.noteId));
      setLoading(false);
    } catch (err) {
      setError("Failed to load favorites.");
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (noteId) => {
    const token = localStorage.getItem("notla_token");
    if (!token) return;

    try {
        const response = await axios.post(`${backendUrl}/api/UserFavorites/Toggle/${noteId}`, null, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if(!response.data.isFavorite) {
            setFavorites(prev => prev.filter(f => f.noteId !== noteId));
        }
    } catch (err) {
        console.error(err);
    }
  };

  const handleDownload = async (noteId, title) => {
    setDownloadingId(noteId);
    try {
      const token = localStorage.getItem("notla_token");
      const libRes = await axios.get(`${backendUrl}/api/Orders/MyLibrary`, { headers: { Authorization: `Bearer ${token}` } });
      const noteData = libRes.data.find(n => n.noteId === noteId);
      
      if(!noteData || !noteData.originalPdfUrl) throw new Error();

      const response = await axios.get(`${backendUrl}${noteData.originalPdfUrl}`, { responseType: 'blob' });
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
      alert("Failed to download. Make sure you own this note and the file exists.");
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

  if (loading) return <div className="text-center py-20 text-2xl font-bold text-rose-500 animate-pulse">Loading Favorites...</div>;
  if (error) return <div className="text-center py-20 text-2xl text-red-500">{error}</div>;

  const unownedFavorites = favorites.filter(fav => !libraryIds.includes(fav.noteId));
  const ownedFavorites = favorites.filter(fav => libraryIds.includes(fav.noteId));

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 relative">
      <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <span className="text-rose-500">❤️</span> My Favorites
        </h1>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <span className="text-6xl block mb-4">🤍</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">You have no favorites yet.</h2>
          <p className="text-gray-500 mb-8">Tap the heart icon on any note to save it for later!</p>
          <Link to="/" className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition-colors">
            Discover Notes
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
            
            {/* UNOWNED FAVORITES */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-lg text-sm">{unownedFavorites.length}</span> Saved for Later
                </h2>
                {unownedFavorites.length === 0 ? (
                    <p className="text-gray-500 italic">You don't have any unowned favorites.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {unownedFavorites.map((item) => (
                        <div key={item.noteId} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden flex flex-col hover:shadow-xl transition-shadow relative">
                        
                        <button 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggleFavorite(item.noteId); }}
                            className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm border border-gray-100 hover:scale-110 transition-all z-10"
                        >
                            <span className="text-xl text-rose-500">❤️</span>
                        </button>

                        <div className="h-56 bg-gray-50 relative border-b border-gray-100 p-4 flex items-center justify-center cursor-pointer" onClick={() => navigate(`/note/${item.noteId}`)}>
                            <img
                            src={item.coverImageUrl ? `${backendUrl}${item.coverImageUrl}` : "https://placehold.co/300x400/e2e8f0/475569?text=Note+Cover"}
                            alt={item.title}
                            className="max-h-full object-contain drop-shadow-md hover:scale-105 transition-transform"
                            />
                        </div>

                        <div className="p-5 flex flex-col flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors" title={item.title} onClick={() => navigate(`/note/${item.noteId}`)}>
                            {item.title}
                            </h3>
                            <div className="mt-auto pt-4">
                                <span className="text-2xl font-black text-blue-600">{item.price} TL</span>
                            </div>
                        </div>
                        </div>
                    ))}
                    </div>
                )}
            </div>

            {/* OWNED FAVORITES (LIBRARY STYLE) */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-t border-gray-200 pt-8">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm">{ownedFavorites.length}</span> Purchased Favorites
                </h2>
                {ownedFavorites.length === 0 ? (
                    <p className="text-gray-500 italic">None of your favorites are currently in your library.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {ownedFavorites.map((item) => (
                        <div key={item.noteId} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden flex flex-col hover:shadow-xl transition-shadow relative">
                        
                        <button 
                            onClick={(e) => { e.preventDefault(); handleToggleFavorite(item.noteId); }}
                            className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm border border-gray-100 hover:scale-110 transition-all z-10"
                        >
                            <span className="text-xl text-rose-500">❤️</span>
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
                                <button
                                    onClick={() => getPdfUrlForReading(item.noteId)}
                                    className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2"
                                >
                                    <span>👁️</span> Read Online
                                </button>
                                <button
                                    onClick={() => handleDownload(item.noteId, item.title)}
                                    disabled={downloadingId === item.noteId}
                                    className={`w-full text-white font-bold py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2 ${downloadingId === item.noteId ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                                >
                                    <span>⬇️</span> {downloadingId === item.noteId ? "Downloading..." : "Download"}
                                </button>
                                <button
                                    onClick={() => { setReviewModal({noteId: item.noteId, title: item.title}); setRating(0); setComment(""); setReviewMessage(""); }}
                                    className="w-full bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-bold py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2 border border-yellow-200"
                                >
                                    <span>⭐</span> Rate & Review
                                </button>
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

export default FavoritesPage;