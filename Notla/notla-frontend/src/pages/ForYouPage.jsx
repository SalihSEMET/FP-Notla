import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NoteCard from '../components/NoteCard';

function ForYouPage() {
  const [feedData, setFeedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const backendUrl = "http://localhost:5261";

  useEffect(() => {
    fetchFeed();
  }, []);

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

      setFeedData(groupedFeed);
      setLoading(false);
      
    } catch (err) {
      console.error(err);
      setError("Failed to load your feed.");
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-2xl font-bold text-blue-500 animate-pulse">Curating your feed...</div>;
  if (error) return <div className="text-center py-20 text-2xl text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-10 border-b border-gray-200 pb-4">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">For You ✨</h1>
        <p className="text-gray-500 text-lg">Latest notes from the sellers you follow.</p>
      </div>

      {feedData.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-100">
          <span className="text-6xl mb-4 block">👀</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Your feed is a bit empty.</h2>
          <p className="text-gray-500 mb-6">The sellers you follow haven't posted any notes yet, or you aren't following anyone who sells notes.</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Explore Marketplace
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {feedData.map(group => (
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
                  <p className="text-sm text-gray-500 font-medium">Added new notes</p>
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
  );
}

export default ForYouPage;