import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function NoteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState("");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [categoryName, setCategoryName] = useState("");

  const [reviews, setReviews] = useState([]);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const [seller, setSeller] = useState(null);

  const [availableDiscounts, setAvailableDiscounts] = useState([]);
  const [selectedDiscount, setSelectedDiscount] = useState(null);

  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  const [isFollowing, setIsFollowing] = useState(false);
  const [isTogglingFollow, setIsTogglingFollow] = useState(false);

  const backendUrl = "http://localhost:5261";

  useEffect(() => {
    const token = localStorage.getItem("notla_token");

    axios.get(`${backendUrl}/api/Notes/${id}`)
      .then((response) => {
        setNote(response.data);
        if (response.data.coverImageUrl) {
            setMainImage(`${backendUrl}${response.data.coverImageUrl}`);
        } else {
            setMainImage("https://placehold.co/600x800/e2e8f0/475569?text=Note+Cover+Image");
        }
        setLoading(false);
        
        if(response.data.categoryId) {
            axios.get(`${backendUrl}/api/Categories/${response.data.categoryId}`)
                .then(catRes => setCategoryName(catRes.data.name))
                .catch(catErr => console.error(catErr));
        }

      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
      
    axios.get(`${backendUrl}/api/Discount/Note/${id}`)
      .then((res) => setAvailableDiscounts(res.data))
      .catch((err) => console.error(err));

    if (token) {
        axios.get(`${backendUrl}/api/UserFavorites/MyFavorites`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            const favNotes = res.data;
            const found = favNotes.some(f => f.noteId === parseInt(id));
            setIsFavorite(found);
        })
        .catch(err => console.error(err));
    }

  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem("notla_token");
    if (note && note.sellerId) {
      axios.get(`${backendUrl}/api/User/PublicProfile/${note.sellerId}`)
           .then(res => setSeller(res.data))
           .catch(err => console.error(err));

      if (token) {
        axios.get(`${backendUrl}/api/Follower/MyFollowing`, { headers: { Authorization: `Bearer ${token}` } })
          .then(res => {
            const found = res.data.some(f => f.userId === note.sellerId);
            setIsFollowing(found);
          })
          .catch(err => console.error(err));
      }
    }
  }, [note]);

  const handleToggleFavorite = async () => {
    const token = localStorage.getItem("notla_token");
    if (!token) {
        navigate("/login");
        return;
    }

    setIsTogglingFavorite(true);
    try {
        const response = await axios.post(`${backendUrl}/api/UserFavorites/Toggle/${id}`, null, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setIsFavorite(response.data.isFavorite);
    } catch (err) {
        console.error(err);
    } finally {
        setIsTogglingFavorite(false);
    }
  };

  const handleToggleFollow = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem("notla_token");
    if (!token) { 
        navigate("/login"); 
        return; 
    }
    
    setIsTogglingFollow(true);
    try {
      const res = await axios.post(`${backendUrl}/api/Follower/ToggleFollow/${seller.id}`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsFollowing(res.data.isFollowing);
    } catch(err) {
      console.error(err);
    } finally {
      setIsTogglingFollow(false);
    }
  };

  const fetchReviews = async () => {
    setShowReviewsModal(true);
    setReviewsLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/NoteReviews/Note/${id}`);
      setReviews(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem("notla_token");
    if (!token) {
      navigate("/login");
      return;
    }

    setIsAddingToCart(true);
    setCartMessage("");

    try {
      await axios.post(`${backendUrl}/api/Cart/Add/${id}`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCartMessage("✅ Successfully added to cart!");
      setTimeout(() => setCartMessage(""), 3000);
    } catch (error) {
      const errorMessage = error.response && error.response.data
        ? error.response.data
        : "Could not add to cart.";
      setCartMessage(`❌ ${errorMessage}`);
      setTimeout(() => setCartMessage(""), 4000);
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-2xl font-bold text-blue-500 animate-pulse">Loading note...</div>;
  if (!note) return <div className="text-center py-20 text-2xl text-red-500">Note not found!</div>;

  const galleryImages = [];
  if (note.coverImageUrl) galleryImages.push(`${backendUrl}${note.coverImageUrl}`);
  else galleryImages.push("https://placehold.co/600x800/e2e8f0/475569?text=Note+Cover+Image");

  if (note.sampleImageUrls && note.sampleImageUrls.length > 0) {
    note.sampleImageUrls.forEach(url => galleryImages.push(`${backendUrl}${url}`));
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 relative">
      <Link to="/" className="text-blue-500 hover:underline mb-6 inline-block">
        &larr; Back to Home
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-8 rounded-2xl shadow-lg border border-gray-100 relative">
        
        <button 
            onClick={handleToggleFavorite}
            disabled={isTogglingFavorite}
            className="absolute top-6 right-6 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-100 hover:scale-110 transition-all z-10 disabled:opacity-50"
            title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        >
            <span className={`text-2xl ${isFavorite ? 'text-rose-500' : 'text-gray-300'}`}>
                {isFavorite ? '❤️' : '🤍'}
            </span>
        </button>

        <div className="flex flex-col space-y-4">
          <div className="w-full h-[500px] bg-gray-50 rounded-xl border border-gray-200 overflow-hidden flex items-center justify-center">
            <img src={mainImage} alt={note.title} className="max-h-full object-contain" />
          </div>

          <div className="flex space-x-4 overflow-x-auto pb-2">
            {galleryImages.map((imgUrl, index) => (
              <div
                key={index}
                onClick={() => setMainImage(imgUrl)}
                className={`w-24 h-32 flex-shrink-0 rounded-lg border-2 cursor-pointer overflow-hidden ${mainImage === imgUrl ? 'border-blue-600 shadow-md' : 'border-gray-200 hover:border-blue-400'}`}
              >
                <img src={imgUrl} alt={`Thumbnail ${index}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col mt-4 md:mt-0">
          <div className="mb-2">
            <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
              Category: {categoryName || note.categoryId}
            </span>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-4 pr-14">{note.title}</h1>

          <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
            <span className="flex items-center">⭐ <b className="ml-1 text-gray-800">{note.rating > 0 ? note.rating.toFixed(1) : "0.0"}</b> / 5</span>
            <span className="flex items-center">👁️ <b className="ml-1 text-gray-800">{note.viewCount || 0}</b> Views</span>
            <span className="flex items-center">🛒 <b className="ml-1 text-gray-800">{note.salesCount || 0}</b> Sales</span>
          </div>

          {seller && (
            <div 
              onClick={() => navigate(`/seller/${seller.id}`)}
              className="flex items-center gap-4 p-4 mb-6 bg-gray-50 rounded-2xl border border-gray-200 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group"
            >
              <img 
                src={seller.profileImageUrl ? `${backendUrl}${seller.profileImageUrl}` : "https://placehold.co/100x100/e2e8f0/475569?text=U"} 
                alt={seller.userName} 
                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
              />
              <div className="flex flex-col">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Published By</p>
                <p className="text-lg font-black text-gray-800 group-hover:text-blue-600 transition-colors">@{seller.userName}</p>
              </div>
              
              <button
                onClick={handleToggleFollow}
                disabled={isTogglingFollow}
                className={`ml-4 px-4 py-2 rounded-lg font-bold text-sm transition-all ${isFollowing ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'}`}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>

              <div className="ml-auto flex items-center gap-2 text-gray-400 group-hover:text-blue-500 transition-colors">
                <span className="font-bold text-xs hidden sm:inline">View Store</span>
                <span className="text-xl font-bold">➔</span>
              </div>
            </div>
          )}

          <button 
            onClick={fetchReviews}
            className="text-blue-600 font-bold hover:underline mb-6 self-start text-sm bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-colors"
          >
            Read User Reviews ({note.reviewCount || 0})
          </button>

          {availableDiscounts.length > 0 && (
              <div className="mb-6">
                  <p className="text-sm font-bold text-indigo-700 mb-2 uppercase tracking-wide">Available Discounts</p>
                  <div className="flex flex-wrap gap-2">
                      {availableDiscounts.map(discount => (
                          <div 
                              key={discount.id}
                              onClick={() => setSelectedDiscount(discount)}
                              className="bg-indigo-50 border border-indigo-200 text-indigo-800 font-bold px-3 py-1.5 rounded-lg text-sm cursor-pointer hover:bg-indigo-100 transition-colors flex items-center gap-2 shadow-sm"
                          >
                              <span>🎫</span> {discount.code}
                          </div>
                      ))}
                  </div>
              </div>
          )}

          <div className="mb-6">
            <span className="text-4xl font-black text-blue-600">{note.price} TL</span>
          </div>

          <div className="mb-8 flex-1">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Note Description</h3>
            <p className="text-gray-600 leading-relaxed">
              {note.content || "No detailed description has been provided for this note yet."}
            </p>
          </div>

          <div className="flex flex-col space-y-3 mt-auto">
            {cartMessage && (
              <div className={`text-center py-2 rounded-lg font-bold ${cartMessage.includes("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {cartMessage}
              </div>
            )}

            {note.demoPdfUrl ? (
              <button
                onClick={() => setShowPdfModal(true)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl transition-colors flex justify-center items-center shadow-sm"
              >
                📄 Review Free Demo PDF
              </button>
            ) : (
              <button
                disabled
                className="w-full bg-gray-50 text-gray-400 font-bold py-3 rounded-xl cursor-not-allowed flex justify-center items-center border border-gray-100"
              >
                📄 Demo PDF Not Available
              </button>
            )}

            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className={`w-full text-white font-bold py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center text-lg ${isAddingToCart ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30'}`}
            >
              {isAddingToCart ? "Adding to Cart..." : "🛒 Add to Cart"}
            </button>
          </div>
        </div>
      </div>

      {selectedDiscount && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm transition-all">
              <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative border border-white/20 p-6 text-center">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl block">🎫</span>
                  </div>
                  <h2 className="text-2xl font-black text-indigo-800 mb-1">{selectedDiscount.code}</h2>
                  <p className="text-indigo-500 font-bold text-sm mb-6 uppercase tracking-widest">Discount Details</p>
                  
                  <div className="space-y-3 mb-8 text-left bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                          <span className="text-gray-500 font-medium text-sm">Value</span>
                          <span className="font-black text-gray-800">{selectedDiscount.discountPercentage ? `${selectedDiscount.discountPercentage}%` : `${selectedDiscount.discountAmount} TL`}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                          <span className="text-gray-500 font-medium text-sm">Min Cart</span>
                          <span className="font-bold text-gray-800">{selectedDiscount.minimumCartAmount ? `${selectedDiscount.minimumCartAmount} TL` : 'No Limit'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-gray-500 font-medium text-sm">Expires On</span>
                          <span className="font-bold text-gray-800">{new Date(selectedDiscount.expirationDate).toLocaleDateString()}</span>
                      </div>
                  </div>

                  <button 
                      onClick={() => setSelectedDiscount(null)} 
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors"
                  >
                      Close
                  </button>
              </div>
          </div>
      )}

      {showPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-md transition-all">
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl relative border border-white/20">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">Demo Preview: {note.title}</h2>
              <button
                onClick={() => setShowPdfModal(false)}
                className="text-gray-500 hover:text-red-600 font-bold text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 w-full h-full bg-gray-200">
              <iframe
                src={`${backendUrl}${note.demoPdfUrl}#toolbar=0`}
                className="w-full h-full border-0"
                title="Demo PDF Preview"
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {showReviewsModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-md transition-all">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl relative border border-white/20">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white/80">
              <h2 className="text-xl font-bold text-gray-800">User Reviews</h2>
              <button onClick={() => setShowReviewsModal(false)} className="text-gray-500 hover:text-red-600 font-bold text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors">✕</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
              {reviewsLoading ? (
                <div className="text-center py-10 font-bold text-blue-500 animate-pulse">Loading reviews...</div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-10 text-gray-500 font-medium">No reviews yet for this note.</div>
              ) : (
                <div className="space-y-4">
                  {reviews.map(review => (
                    <div key={review.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 border border-gray-300 flex-shrink-0">
                           <img 
                             src={review.profileImageUrl ? `${backendUrl}${review.profileImageUrl}` : "https://placehold.co/100x100/e2e8f0/475569?text=U"} 
                             alt={review.userName} 
                             className="w-full h-full object-cover" 
                           />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{review.userName}</p>
                          <div className="flex text-yellow-400 text-sm drop-shadow-sm">
                            {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                          </div>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NoteDetailPage;