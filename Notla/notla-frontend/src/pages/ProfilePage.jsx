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

  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountType, setDiscountType] = useState('percentage');
  const [discountData, setDiscountData] = useState({
    code: "",
    value: "",
    expirationDate: "",
    minimumCartAmount: ""
  });
  const [selectedNoteIds, setSelectedNoteIds] = useState([]);
  const [discountCreating, setDiscountCreating] = useState(false);

  const [showManageDiscountsModal, setShowManageDiscountsModal] = useState(false);
  const [myDiscounts, setMyDiscounts] = useState([]);
  const [loadingDiscounts, setLoadingDiscounts] = useState(false);

  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followModalType, setFollowModalType] = useState(null);

  const navigate = useNavigate();
  const backendUrl = "http://localhost:5261";
  const defaultAvatar = "https://placehold.co/400x400/e2e8f0/475569?text=Avatar";

  useEffect(() => {
    fetchProfile();
    fetchMySellingNotes();
    fetchFollowData();
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

  const fetchFollowData = async () => {
    const token = localStorage.getItem("notla_token");
    if(!token) return;
    try {
      const [followersRes, followingRes] = await Promise.all([
        axios.get(`${backendUrl}/api/Follower/MyFollowers`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${backendUrl}/api/Follower/MyFollowing`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setFollowers(followersRes.data);
      setFollowing(followingRes.data);
    } catch(err) {
      console.error(err);
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

  const fetchMyDiscounts = async () => {
    const token = localStorage.getItem("notla_token");
    if (!token) return;

    setLoadingDiscounts(true);
    try {
      const response = await axios.get(`${backendUrl}/api/Discount/MyDiscounts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyDiscounts(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDiscounts(false);
    }
  };

  const handleOpenManageDiscounts = () => {
    setShowManageDiscountsModal(true);
    fetchMyDiscounts();
  };

  const handleDeleteDiscount = async (id) => {
      const token = localStorage.getItem("notla_token");
      if (!token) return;

      try {
          await axios.delete(`${backendUrl}/api/Discount/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setActionMessage("✅ Discount Code Deleted Successfully!");
          fetchMyDiscounts();
          setTimeout(() => setActionMessage(""), 3000);
      } catch (err) {
          alert("Failed to delete discount.");
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

  const handleCreateDiscount = async (e) => {
    e.preventDefault();
    if (selectedNoteIds.length === 0) {
      alert("Please select at least one note to apply this discount.");
      return;
    }

    const token = localStorage.getItem("notla_token");
    if (!token) return;

    setDiscountCreating(true);

    const payload = {
      code: discountData.code,
      expirationDate: new Date(discountData.expirationDate).toISOString(),
      minimumCartAmount: discountData.minimumCartAmount ? parseFloat(discountData.minimumCartAmount) : 0,
      applicableNoteIds: selectedNoteIds,
      discountPercentage: discountType === 'percentage' ? parseFloat(discountData.value) : null,
      discountAmount: discountType === 'amount' ? parseFloat(discountData.value) : null
    };

    try {
      await axios.post(`${backendUrl}/api/Discount/CreateSellerDiscount`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setActionMessage("✅ Discount Code Created Successfully!");
      setShowDiscountModal(false);
      setDiscountData({ code: "", value: "", expirationDate: "", minimumCartAmount: "" });
      setSelectedNoteIds([]);
      setTimeout(() => setActionMessage(""), 3000);
    } catch (err) {
      alert(err.response?.data || "Failed to create discount code.");
    } finally {
      setDiscountCreating(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedNoteIds.length === myNotes.length) {
      setSelectedNoteIds([]);
    } else {
      setSelectedNoteIds(myNotes.map(n => n.id));
    }
  };

  const toggleNoteSelection = (id) => {
    setSelectedNoteIds(prev => 
      prev.includes(id) ? prev.filter(nId => nId !== id) : [...prev, id]
    );
  };

  if (loading) return <div className="text-center py-20 text-2xl font-bold text-blue-500 animate-pulse">Loading Profile...</div>;
  if (error) return <div className="text-center py-20 text-2xl text-red-500">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
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
              
              <div className="flex flex-wrap justify-center sm:justify-end gap-4 items-center">
                <div 
                    onClick={() => setFollowModalType('followers')} 
                    className="bg-indigo-50 border border-indigo-100 px-5 py-2 rounded-2xl text-center shadow-sm cursor-pointer hover:bg-indigo-100 transition-colors"
                >
                    <p className="text-xs font-bold text-indigo-800 uppercase tracking-wide">Followers</p>
                    <p className="text-xl font-black text-indigo-600">{followers.length}</p>
                </div>
                <div 
                    onClick={() => setFollowModalType('following')} 
                    className="bg-teal-50 border border-teal-100 px-5 py-2 rounded-2xl text-center shadow-sm cursor-pointer hover:bg-teal-100 transition-colors"
                >
                    <p className="text-xs font-bold text-teal-800 uppercase tracking-wide">Following</p>
                    <p className="text-xl font-black text-teal-600">{following.length}</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 px-6 py-3 rounded-2xl text-center shadow-sm">
                  <p className="text-sm font-bold text-blue-800 uppercase tracking-wide">Wallet Balance</p>
                  <p className="text-2xl font-black text-blue-600">{profile.walletBalance} TL</p>
                </div>
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
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <h2 className="text-3xl font-black text-gray-800">My Notes on Sale</h2>
            <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
                <button 
                  onClick={handleOpenManageDiscounts} 
                  className="flex-1 sm:flex-none bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 font-bold py-2 px-4 rounded-lg shadow-sm transition-colors whitespace-nowrap"
                >
                  ⚙️ Manage Discounts
                </button>
                <button 
                  onClick={() => setShowDiscountModal(true)} 
                  className="flex-1 sm:flex-none bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold py-2 px-4 rounded-lg shadow-sm transition-colors whitespace-nowrap"
                >
                  🏷️ Create Discount
                </button>
                <button 
                  onClick={() => navigate('/sell-note')} 
                  className="flex-1 sm:flex-none bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-colors whitespace-nowrap"
                >
                  + Sell New Note
                </button>
            </div>
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

      {showDiscountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl relative border border-white/20 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-indigo-50">
              <h2 className="text-xl font-black text-indigo-900">🏷️ Create Discount Code</h2>
              <button onClick={() => setShowDiscountModal(false)} className="text-indigo-400 hover:text-red-600 font-bold text-2xl transition-colors">✕</button>
            </div>
            
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                <div className="w-full md:w-1/2 p-6 border-b md:border-b-0 md:border-r border-gray-100 overflow-y-auto">
                    <form id="discountForm" onSubmit={handleCreateDiscount} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Coupon Code</label>
                            <input 
                                type="text" required maxLength="15"
                                value={discountData.code}
                                onChange={e => setDiscountData({...discountData, code: e.target.value.toUpperCase()})}
                                placeholder="e.g. SUMMER20"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none uppercase font-bold"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Discount Type</label>
                            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-2">
                                <button type="button" onClick={() => setDiscountType('percentage')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${discountType === 'percentage' ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}>Percentage (%)</button>
                                <button type="button" onClick={() => setDiscountType('amount')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${discountType === 'amount' ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}>Fixed Amount (TL)</button>
                            </div>
                            <div className="relative">
                                <input 
                                    type="number" step="0.01" min="0.01" required
                                    value={discountData.value}
                                    onChange={e => setDiscountData({...discountData, value: e.target.value})}
                                    placeholder={discountType === 'percentage' ? "e.g. 15" : "e.g. 50"}
                                    className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-bold"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">
                                    {discountType === 'percentage' ? '%' : 'TL'}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Expiration Date & Time</label>
                            <input 
                                type="datetime-local" required
                                value={discountData.expirationDate}
                                onChange={e => setDiscountData({...discountData, expirationDate: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Minimum Cart Amount (TL) <span className="text-gray-400 font-normal">(Optional)</span></label>
                            <input 
                                type="number" step="0.01" min="0"
                                value={discountData.minimumCartAmount}
                                onChange={e => setDiscountData({...discountData, minimumCartAmount: e.target.value})}
                                placeholder="0.00"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-medium"
                            />
                        </div>
                    </form>
                </div>

                <div className="w-full md:w-1/2 flex flex-col bg-gray-50 h-64 md:h-auto">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
                        <div>
                            <h3 className="font-bold text-gray-800">Applicable Notes</h3>
                            <p className="text-xs text-gray-500">{selectedNoteIds.length} of {myNotes.length} selected</p>
                        </div>
                        <button 
                            type="button" 
                            onClick={toggleSelectAll}
                            className="text-xs font-bold px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                        >
                            {selectedNoteIds.length === myNotes.length ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {myNotes.length === 0 ? (
                            <div className="text-center py-10 text-gray-400 font-medium">You have no notes on sale.</div>
                        ) : (
                            myNotes.map(note => (
                                <div 
                                    key={note.id} 
                                    onClick={() => toggleNoteSelection(note.id)}
                                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedNoteIds.includes(note.id) ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-gray-200 hover:border-indigo-200'}`}
                                >
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${selectedNoteIds.includes(note.id) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white'}`}>
                                        {selectedNoteIds.includes(note.id) && <span className="text-white text-xs font-bold">✓</span>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-800 text-sm truncate">{note.title}</p>
                                        <p className="text-xs font-bold text-green-600">{note.price} TL</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="p-5 border-t border-gray-100 bg-white">
                <button 
                    form="discountForm"
                    type="submit" 
                    disabled={discountCreating || selectedNoteIds.length === 0}
                    className={`w-full py-4 rounded-xl font-black text-white text-lg transition-all shadow-lg ${discountCreating || selectedNoteIds.length === 0 ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/30'}`}
                >
                    {discountCreating ? "Creating..." : "Create Discount Code"}
                </button>
            </div>

          </div>
        </div>
      )}

      {showManageDiscountsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative border border-white/20 flex flex-col max-h-[85vh]">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-black text-gray-800">⚙️ Manage Discounts</h2>
              <button onClick={() => setShowManageDiscountsModal(false)} className="text-gray-400 hover:text-red-600 font-bold text-2xl transition-colors">✕</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                {loadingDiscounts ? (
                    <div className="text-center py-10 font-bold text-blue-500 animate-pulse">Loading active discounts...</div>
                ) : myDiscounts.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                        <span className="text-4xl mb-3 block">🎫</span>
                        <p className="text-gray-500 font-medium text-lg">You haven't created any discount codes yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {myDiscounts.map(discount => {
                            const isExpired = new Date(discount.expirationDate) < new Date();
                            return (
                            <div key={discount.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-black text-indigo-700 tracking-wider">{discount.code}</h3>
                                        {isExpired ? (
                                            <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded-md border border-red-100">EXPIRED</span>
                                        ) : (
                                            <span className="bg-green-50 text-green-600 text-xs font-bold px-2 py-1 rounded-md border border-green-100">ACTIVE</span>
                                        )}
                                    </div>
                                    <div className="text-sm font-medium text-gray-600 space-y-1 mb-3">
                                        <p>Discount: <span className="font-bold text-gray-800">{discount.discountPercentage ? `${discount.discountPercentage}%` : `${discount.discountAmount} TL`}</span></p>
                                        <p>Min Cart Amount: <span className="font-bold text-gray-800">{discount.minimumCartAmount ? `${discount.minimumCartAmount} TL` : 'None'}</span></p>
                                        <p>Expires: <span className={`font-bold ${isExpired ? 'text-red-500' : 'text-gray-800'}`}>{new Date(discount.expirationDate).toLocaleString()}</span></p>
                                        <p>Applicable Notes: <span className="font-bold text-gray-800">{discount.applicableNoteIds ? discount.applicableNoteIds.length : 0}</span> items</p>
                                    </div>
                                    
                                    {discount.applicableNoteIds && discount.applicableNoteIds.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {discount.applicableNoteIds.map(noteId => {
                                                const matchedNote = myNotes.find(n => n.id === noteId);
                                                if (!matchedNote) return null;
                                                return (
                                                    <div 
                                                        key={noteId} 
                                                        onClick={() => navigate(`/note/${noteId}`)}
                                                        className="w-10 h-14 bg-gray-100 rounded overflow-hidden cursor-pointer border border-gray-200 hover:border-indigo-500 hover:shadow-md transition-all flex-shrink-0"
                                                        title={matchedNote.title}
                                                    >
                                                        <img 
                                                            src={matchedNote.coverImageUrl ? `${backendUrl}${matchedNote.coverImageUrl}` : "https://placehold.co/150x200/e2e8f0/475569?text=N"} 
                                                            alt={matchedNote.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                <button 
                                    onClick={() => {
                                        if(window.confirm(`Are you sure you want to delete the coupon code ${discount.code}?`)) {
                                            handleDeleteDiscount(discount.id);
                                        }
                                    }}
                                    className="w-full sm:w-auto bg-red-50 hover:bg-red-600 text-red-600 hover:text-white font-bold py-2 px-5 rounded-xl transition-colors border border-red-100 shadow-sm"
                                >
                                    Delete Coupon
                                </button>
                            </div>
                        )})}
                    </div>
                )}
            </div>
          </div>
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

      {followModalType && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col max-h-[80vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-black text-gray-800">
                {followModalType === 'followers' ? 'My Followers' : 'Following'}
              </h2>
              <button onClick={() => setFollowModalType(null)} className="text-gray-400 hover:text-red-600 font-bold text-2xl transition-colors">✕</button>
            </div>
            <div className="overflow-y-auto p-4 bg-gray-50">
              {(followModalType === 'followers' ? followers : following).length === 0 ? (
                <p className="text-center text-gray-500 py-8 font-medium">No users found.</p>
              ) : (
                <div className="space-y-3">
                  {(followModalType === 'followers' ? followers : following).map(user => (
                    <div 
                      key={user.userId} 
                      onClick={() => navigate(`/seller/${user.userId}`)}
                      className="flex items-center gap-4 p-3 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-blue-200 cursor-pointer transition-all"
                    >
                      <img 
                        src={user.profileImageUrl ? `${backendUrl}${user.profileImageUrl}` : "https://placehold.co/100x100/e2e8f0/475569?text=U"}
                        alt={user.userName}
                        className="w-12 h-12 rounded-full object-cover border border-gray-200"
                      />
                      <div>
                        <p className="font-bold text-gray-900">@{user.userName}</p>
                      </div>
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

export default ProfilePage;