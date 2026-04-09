import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [bio, setBio] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  
  const [myNotes, setMyNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  
  const [editingNote, setEditingNote] = useState(null);
  const [editFormData, setEditFormData] = useState({ id: 0, title: "", content: "", price: 0, categoryId: 0 });
  
  const [viewingNote, setViewingNote] = useState(null);
  const [noteReviews, setNoteReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [actionMessage, setActionMessage] = useState("");

  const navigate = useNavigate();
  const backendUrl = "http://localhost:5261";
  const defaultAvatar = "https://placehold.co/400x400/e2e8f0/475569?text=Avatar";

  useEffect(() => {
    fetchProfile();
    fetchMySellingNotes();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem("notla_token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get(`${backendUrl}/api/User/Profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
      setBio(response.data.bio || "");
      setPreviewImage(response.data.profileImageUrl ? `${backendUrl}${response.data.profileImageUrl}` : defaultAvatar);
      setLoading(false);
    } catch (err) {
      setError("Failed to load profile data.");
      setLoading(false);
    }
  };

const fetchMySellingNotes = async () => {
    const token = localStorage.getItem("notla_token");
    if (!token) return;

    setLoadingNotes(true);
    try {
      const response = await axios.get(`${backendUrl}/api/Notes/MySellingNotes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMyNotes(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMessage("");

    const token = localStorage.getItem("notla_token");
    const formData = new FormData();
    formData.append("Bio", bio);
    if (imageFile) {
      formData.append("ProfileImage", imageFile);
    }

    try {
      const response = await axios.put(`${backendUrl}/api/User/UpdateProfile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUpdateMessage("✅ Profile updated successfully!");
      if (response.data.profileImageUrl) {
        setPreviewImage(`${backendUrl}${response.data.profileImageUrl}`);
      }
      setTimeout(() => setUpdateMessage(""), 3000);
    } catch (err) {
      setUpdateMessage("❌ Failed to update profile.");
      setTimeout(() => setUpdateMessage(""), 3000);
    } finally {
      setIsUpdating(false);
    }
  };

  const openEditModal = (note) => {
    setEditFormData({
      id: note.id,
      title: note.title,
      content: note.content || "No description provided",
      price: note.price,
      categoryId: note.categoryId
    });
    setEditingNote(note);
  };

  const handleNoteUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("notla_token");
    try {
      await axios.put(`${backendUrl}/api/Notes`, editFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActionMessage("✅ Price successfully updated!");
      setEditingNote(null);
      fetchMySellingNotes();
      setTimeout(() => setActionMessage(""), 3000);
    } catch (err) {
      alert("Failed to update price.");
    }
  };

  const handleDeleteNote = async () => {
    const token = localStorage.getItem("notla_token");
    try {
      await axios.delete(`${backendUrl}/api/Notes/${deleteConfirm}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActionMessage("✅ Note successfully removed from marketplace.");
      setDeleteConfirm(null);
      fetchMySellingNotes();
      setTimeout(() => setActionMessage(""), 3000);
    } catch (err) {
      alert("Failed to delete note.");
      setDeleteConfirm(null);
    }
  };

  const openStatsModal = async (note) => {
    setViewingNote(note);
    setReviewsLoading(true);
    setNoteReviews([]);
    try {
      const response = await axios.get(`${backendUrl}/api/NoteReviews/Note/${note.id}`);
      setNoteReviews(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setReviewsLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-2xl font-bold text-blue-500 animate-pulse">Loading Profile...</div>;
  if (error) return <div className="text-center py-20 text-2xl text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex justify-center mb-10 space-x-4">
        <button 
          onClick={() => setActiveTab('profile')}
          className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          My Profile
        </button>
        <button 
          onClick={() => setActiveTab('seller')}
          className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'seller' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Seller Dashboard
        </button>
      </div>

      {activeTab === 'profile' && profile && (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-blue-600 h-32 relative"></div>
          
          <div className="px-8 pb-8 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 mb-8 gap-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                  <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <label className="absolute inset-0 bg-black bg-opacity-50 text-white flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity font-bold">
                  Change
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              </div>
              
              <div className="text-center sm:text-left flex-1 mb-2">
                <h1 className="text-3xl font-black text-gray-900">{profile.firstName} {profile.lastName}</h1>
                <p className="text-gray-500 font-medium">@{profile.userName}</p>
              </div>
              
              <div className="bg-blue-50 border border-blue-100 px-6 py-3 rounded-2xl text-center shadow-sm">
                <p className="text-sm font-bold text-blue-800 uppercase tracking-wide">Wallet Balance</p>
                <p className="text-2xl font-black text-blue-600">{profile.walletBalance} TL</p>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                  <input type="text" value={profile.firstName} disabled className="w-full bg-gray-50 border border-gray-200 text-gray-500 px-4 py-3 rounded-xl cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                  <input type="text" value={profile.lastName} disabled className="w-full bg-gray-50 border border-gray-200 text-gray-500 px-4 py-3 rounded-xl cursor-not-allowed" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                <input type="email" value={profile.email} disabled className="w-full bg-gray-50 border border-gray-200 text-gray-500 px-4 py-3 rounded-xl cursor-not-allowed" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Bio / About Me</label>
                <textarea 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Write a little bit about yourself..."
                  rows="4"
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
                ></textarea>
              </div>

              {updateMessage && (
                <div className={`text-center py-3 rounded-xl font-bold ${updateMessage.includes("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {updateMessage}
                </div>
              )}

              <div className="flex justify-end">
                <button 
                  type="submit" 
                  disabled={isUpdating}
                  className={`px-8 py-3 rounded-xl text-white font-bold transition-all shadow-md ${isUpdating ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'}`}
                >
                  {isUpdating ? "Saving Changes..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'seller' && (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-black text-gray-800">My Notes on Sale</h2>
            <button onClick={() => navigate('/sell-note')} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg shadow-sm transition-colors">
              + Sell New Note
            </button>
          </div>

          {actionMessage && (
            <div className="mb-6 p-4 rounded-xl font-bold text-center bg-green-100 text-green-800 border border-green-200">
              {actionMessage}
            </div>
          )}

          {loadingNotes ? (
             <div className="text-center py-20 font-bold text-blue-500 animate-pulse">Loading your marketplace inventory...</div>
          ) : myNotes.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
              <span className="text-6xl mb-4 block">📦</span>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No notes currently on sale.</h3>
              <p className="text-gray-500 mb-6">Note: Your newly submitted notes will appear here once approved by the Admin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myNotes.map(note => (
                <div key={note.id} className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{note.title}</h3>
                    <p className="text-2xl font-black text-green-600 mb-4">{note.price} TL</p>
                    
                    <div className="grid grid-cols-3 gap-2 text-center mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
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
                        <p className="font-black text-yellow-600 flex items-center justify-center gap-1">
                          {note.rating > 0 ? note.rating : "-"} <span className="text-sm">⭐</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-auto space-y-3">
                      <button 
                        onClick={() => openStatsModal(note)}
                        className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-3 rounded-xl transition-colors border border-blue-100 flex justify-center items-center gap-2"
                      >
                        <span>📊</span> Stats & Reviews
                      </button>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => openEditModal(note)}
                          className="flex-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-bold py-3 rounded-xl transition-colors border border-yellow-200"
                        >
                          ✏️ Edit Price
                        </button>
                        <button 
                          onClick={() => setDeleteConfirm(note.id)}
                          className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 rounded-xl transition-colors border border-red-200"
                        >
                          🗑️ Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {editingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative border border-white/20">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-black text-gray-800">Edit Selling Price</h2>
              <button onClick={() => setEditingNote(null)} className="text-gray-400 hover:text-red-600 font-bold text-2xl transition-colors">✕</button>
            </div>
            <form onSubmit={handleNoteUpdate} className="p-8 space-y-6">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                <p className="text-sm text-blue-800 font-bold mb-1">Updating Listing:</p>
                <p className="text-lg font-black text-blue-900 line-clamp-1">{editingNote.title}</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">New Price (TL)</label>
                <input 
                  type="number" step="0.01" min="0" required value={editFormData.price}
                  onChange={e => setEditFormData({...editFormData, price: e.target.value})}
                  className="w-full px-4 py-4 text-center text-3xl font-black rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 outline-none text-green-600 transition-colors"
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg transition-all text-lg hover:shadow-blue-500/30">
                Update Price
              </button>
            </form>
          </div>
        </div>
      )}

      {viewingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl relative border border-white/20">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-black text-gray-800 line-clamp-1">{viewingNote.title}</h2>
              <button onClick={() => setViewingNote(null)} className="text-gray-400 hover:text-red-600 font-bold text-2xl transition-colors">✕</button>
            </div>
            <div className="p-8 overflow-y-auto bg-white flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">Views</p>
                  <p className="text-3xl font-black text-gray-800">{viewingNote.viewCount}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">Sales</p>
                  <p className="text-3xl font-black text-gray-800">{viewingNote.salesCount}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">Rating</p>
                  <p className="text-3xl font-black text-yellow-500">{viewingNote.rating > 0 ? viewingNote.rating : "-"}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">Reviews</p>
                  <p className="text-3xl font-black text-gray-800">{viewingNote.reviewCount}</p>
                </div>
              </div>

              <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
                <span>💬</span> Customer Reviews
              </h3>
              
              {reviewsLoading ? (
                <div className="text-center py-10 text-blue-500 font-bold animate-pulse bg-gray-50 rounded-2xl">Loading reviews...</div>
              ) : noteReviews.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                  <p className="text-gray-500 font-medium text-lg">No reviews received yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {noteReviews.map(review => (
                    <div key={review.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-4 mb-3">
                        <img 
                           src={review.profileImageUrl ? `${backendUrl}${review.profileImageUrl}` : "https://placehold.co/100x100/e2e8f0/475569?text=U"} 
                           alt="User" 
                           className="w-12 h-12 rounded-full object-cover border-2 border-gray-100" 
                        />
                        <div>
                          <p className="font-bold text-gray-900">{review.userName}</p>
                          <div className="text-yellow-400 text-sm drop-shadow-sm">
                            {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                          </div>
                        </div>
                      </div>
                      {review.comment && <p className="text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100 leading-relaxed">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative border border-white/20 p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl block">⚠️</span>
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-3">Remove Note?</h2>
            <p className="text-gray-500 mb-8 font-medium leading-relaxed">Are you sure you want to permanently remove this note from the marketplace? This action cannot be undone.</p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={handleDeleteNote} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-md transition-colors shadow-red-500/30">
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;