import { useState, useEffect } from 'react';
import axios from 'axios';
import NoteCard from '../components/NoteCard';

function HomePage() {
  const [trendingNotes, setTrendingNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    axios.get('http://localhost:5261/api/Notes/Trending')
      .then((response) => {
        setTrendingNotes(response.data); 
        setLoading(false); 
      })
      .catch((error) => {
        console.error("API'den veri çekilirken hata oluştu:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="py-6">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-4">Today's Highlights 🚀</h1>
        <p className="text-gray-600 text-lg">Best-selling, most-reviewed, and highest-rated books.</p>
      </div>

      {}
      {loading && <div className="text-center text-xl text-blue-500 font-bold animate-pulse">Notlar Loading...</div>}

      {}
      {!loading && trendingNotes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {trendingNotes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}

      {}
      {!loading && trendingNotes.length === 0 && (
        <div className="text-center text-gray-500 bg-gray-50 p-10 rounded-xl">
          No trending notes were found at the moment.
        </div>
      )}
    </div>
  );
}

export default HomePage;