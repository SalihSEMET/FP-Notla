import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function PublicSellerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const backendUrl = "http://localhost:5261";

  const [seller, setSeller] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [reviews, setReviews] = useState([]);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const [isFollowing, setIsFollowing] = useState(false);
  const [isTogglingFollow, setIsTogglingFollow] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("notla_token");

    const fetchSellerAndNotes = async () => {
      try {
        const sellerRes = await axios.get(`${backendUrl}/api/User/PublicProfile/${id}`);
        setSeller(sellerRes.data);

        const notesRes = await axios.get(`${backendUrl}/api/Notes`);
        const sellerNotes = notesRes.data.filter(n => String(n.sellerId) === String(id));
        setNotes(sellerNotes);
        
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchSellerAndNotes();

    if (token) {
        axios.get(`${backendUrl}/api/Follower/MyFollowing`, { headers: { Authorization: `Bearer ${token}` } })
          .then(res => {
            const found = res.data.some(f => f.userId === parseInt(id));
            setIsFollowing(found);
          })
          .catch(err => console.error(err));
    }

  }, [id]);

  const handleToggleFollow = async () => {
    const token = localStorage.getItem("notla_token");
    if (!token) { 
        navigate("/login"); 
        return; 
    }
    
    setIsTogglingFollow(true);
    try {
      const res = await axios.post(`${backendUrl}/api/Follower/ToggleFollow/${id}`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsFollowing(res.data.isFollowing);
    } catch(err) {
      console.error(err);
    } finally {
      setIsTogglingFollow(false);
    }
  };

  const fetchReviews = async (noteId, e) => {
    e.stopPropagation();
    setShowReviewsModal(true);
    setReviewsLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/NoteReviews/Note/${noteId}`);
      setReviews(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setReviewsLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-blue-500 font-bold animate-pulse text-2xl">Loading Seller Store...</div>;
  if (!seller) return <div className="text-center py-20 text-red-500 font-bold text-2xl">Seller not found.</div>;

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 relative">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-10">
        <div className="bg-blue-600 h-40"></div>
        <div className="px-8 pb-8 flex flex-col sm:flex-row items-center sm:items-end -mt-20 gap-6 text-center sm:text-left">
          <img 
            src={seller.profileImageUrl ? `${backendUrl}${seller.profileImageUrl}` : "https://placehold.co/400x400/e2e8f0/475569?text=Avatar"} 
            alt="Profile" 
            className="w-36 h-36 rounded-full border-4 border-white shadow-lg object-cover bg-white"
          />
          <div className="flex-1 mb-2">
            <h1 className="text-3xl font-black text-white">@{seller.userName}</h1>
            <p className="text-blue-100 font-medium mt-1 mb-3">Joined: {new Date(seller.createdDate).toLocaleDateString()}</p>
            <button
              onClick={handleToggleFollow}
              disabled={isTogglingFollow}
              className={`px-8 py-2.5 rounded-xl font-bold transition-all shadow-sm ${isFollowing ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200' : 'bg-white text-blue-600 hover:bg-gray-50 hover:shadow-md'}`}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          </div>
        </div>
        {seller.bio && (
          <div className="px-8 pb-8">
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <p className="text-gray-700 italic text-lg text-center sm:text-left">"{seller.bio}"</p>
            </div>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
        <span>📚</span> Notes by @{seller.userName}
      </h2>
      
      {notes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-100">
           <h3 className="text-xl font-bold text-gray-500">This seller has no public notes yet.</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map(note => (
            <div key={note.id} className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-all flex flex-col group">
              <div 
                className="p-5 flex flex-col flex-1 cursor-pointer"
                onClick={() => navigate(`/note/${note.id}`)}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">{note.title}</h3>
                <p className="text-2xl font-black text-green-600 mb-4">{note.price} TL</p>
                
                <div className="grid grid-cols-3 gap-2 text-center mt-auto bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase">Views</p>
                    <p className="font-black text-gray-800">{note.viewCount}</p>
                  </div>
                  <div className="border-l border-r border-gray-200">
                    <p className="text-xs text-gray-500 font-bold uppercase">Sales</p>
                    <p className="font-black text-gray-800">{note.salesCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase">Rating</p>
                    <p className="font-black text-yellow-500">{note.rating > 0 ? note.rating.toFixed(1) : "-"}</p>
                  </div>
                </div>
              </div>
              
              <div className="px-5 pb-5 mt-auto">
                <button 
                  onClick={(e) => fetchReviews(note.id, e)}
                  className="w-full text-blue-600 font-bold text-sm bg-blue-50 hover:bg-blue-100 py-3 rounded-lg border border-blue-100 transition-colors flex justify-center items-center gap-2"
                >
                  💬 Read User Reviews ({note.reviewCount || 0})
                </button>
              </div>
            </div>
          ))}
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

export default PublicSellerProfile;