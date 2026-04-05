import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bio, setBio] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");

  const navigate = useNavigate();
  const backendUrl = "http://localhost:5261";
  const defaultAvatar = "https://placehold.co/400x400/e2e8f0/475569?text=Avatar";

  useEffect(() => {
    fetchProfile();
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
      setUpdateMessage("✅ " + response.data.message);
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

  if (loading) return <div className="text-center py-20 text-2xl font-bold text-blue-500 animate-pulse">Loading Profile...</div>;
  if (error) return <div className="text-center py-20 text-2xl text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        
        <div className="bg-blue-600 h-32 relative"></div>

        <div className="px-8 pb-8 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 mb-8 gap-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <label className="absolute inset-0 bg-black bg-opacity-50 text-white flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity font-bold text-sm">
                Change Photo
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
    </div>
  );
}

export default ProfilePage;