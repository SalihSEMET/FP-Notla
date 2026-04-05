import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function LibraryPage() {
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const navigate = useNavigate();
  const backendUrl = "http://localhost:5261";

  useEffect(() => {
    fetchLibrary();
  }, []);

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
      setLibrary(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load your library.");
      setLoading(false);
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

  if (loading) return <div className="text-center py-20 text-2xl font-bold text-blue-500 animate-pulse">Loading Your Library...</div>;
  if (error) return <div className="text-center py-20 text-2xl text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 relative">
      <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-extrabold text-gray-900">My Library</h1>
        <span className="bg-blue-100 text-blue-800 font-bold px-4 py-2 rounded-lg">
          {library.length} Notes Owned
        </span>
      </div>

      {library.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your library is currently empty.</h2>
          <p className="text-gray-500 mb-8">Start exploring the marketplace to add some valuable notes here!</p>
          <Link to="/" className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition-colors">
            Explore Notes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {library.map((item) => (
            <div key={item.noteId} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden flex flex-col hover:shadow-xl transition-shadow">
              
              <div className="h-56 bg-gray-50 relative border-b border-gray-100 p-4 flex items-center justify-center">
                <img
                  src={item.coverImageUrl ? `${backendUrl}${item.coverImageUrl}` : "https://placehold.co/300x400/e2e8f0/475569?text=Note+Cover"}
                  alt={item.title}
                  className="max-h-full object-contain drop-shadow-md"
                />
              </div>

              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-4 line-clamp-2" title={item.title}>
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
                        <span>⬇️</span> {downloadingId === item.noteId ? "Downloading..." : "Download PDF"}
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
    </div>
  );
}

export default LibraryPage;