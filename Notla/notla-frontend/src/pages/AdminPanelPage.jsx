import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminPanelPage() {
  const [pendingNotes, setPendingNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  
  const [inspectNote, setInspectNote] = useState(null);
  const [pdfView, setPdfView] = useState(null);
  const [imageView, setImageView] = useState(null);

  const navigate = useNavigate();
  const backendUrl = "http://localhost:5261";

  useEffect(() => {
    fetchPendingNotes();
  }, []);

  const fetchPendingNotes = async () => {
    const token = localStorage.getItem("notla_token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get(`${backendUrl}/api/Admin/PendingNotes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingNotes(response.data);
      setLoading(false);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError("You do not have permission to access the Admin Panel.");
      } else {
        setError("Failed to load pending notes.");
      }
      setLoading(false);
    }
  };

  const handleAction = async (noteId, action) => {
    const token = localStorage.getItem("notla_token");
    try {
      const endpoint = action === 'approve' ? 'ApproveNote' : 'RejectNote';
      await axios.post(`${backendUrl}/api/Admin/${endpoint}/${noteId}`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setActionMessage(`Note successfully ${action}d!`);
      setPendingNotes(pendingNotes.filter(note => note.id !== noteId));
      setInspectNote(null);
      setPdfView(null);
      setImageView(null);
      
      setTimeout(() => setActionMessage(""), 3000);
    } catch (err) {
      alert(`Failed to ${action} note.`);
    }
  };

  if (loading) return <div className="text-center py-20 text-2xl font-bold text-blue-500 animate-pulse">Loading Admin Panel...</div>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="bg-slate-900 rounded-3xl shadow-2xl p-8 mb-8 text-white flex justify-between items-center border border-slate-800">
        <div>
          <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
            <span className="text-4xl">🛡️</span> Admin Command Center
          </h1>
          <p className="text-slate-400 font-medium">Review and moderate user-submitted notes.</p>
        </div>
        <div className="bg-slate-800 px-6 py-3 rounded-xl border border-slate-700">
          <span className="text-slate-300 font-bold">Pending Approval:</span>
          <span className="ml-3 text-2xl font-black text-blue-400">{pendingNotes.length}</span>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center font-bold text-xl border border-red-100 shadow-sm">
          {error}
        </div>
      ) : (
        <>
          {actionMessage && (
            <div className="bg-green-100 text-green-800 p-4 rounded-xl mb-6 text-center font-bold shadow-sm border border-green-200">
              {actionMessage}
            </div>
          )}

          {pendingNotes.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-500">No notes waiting for approval.</h2>
              <p className="text-gray-400 mt-2">The marketplace is up to date.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingNotes.map(note => (
                <div key={note.id} className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden flex flex-col">
                  <div className="h-48 bg-gray-100 relative p-4 flex items-center justify-center border-b border-gray-200">
                     <img
                        src={note.coverImageUrl ? `${backendUrl}${note.coverImageUrl}` : "https://placehold.co/300x400/e2e8f0/475569?text=Cover"}
                        alt={note.title}
                        className="max-h-full object-contain drop-shadow-sm"
                      />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{note.title}</h3>
                    <div className="flex justify-between items-center mb-4 text-sm font-medium text-gray-500">
                      <span>Price: <b className="text-blue-600">{note.price} TL</b></span>
                      <span>Cat ID: {note.categoryId}</span>
                    </div>
                    
                    <div className="mt-auto">
                      <button
                        onClick={() => setInspectNote(note)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2 shadow-md"
                      >
                        <span>🔍</span> Inspect & Moderate
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {inspectNote && !pdfView && !imageView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md transition-all">
          <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative border border-white/20">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-2xl font-black text-gray-800">Note Inspector</h2>
              <button onClick={() => setInspectNote(null)} className="text-gray-500 hover:text-red-600 font-bold text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 flex flex-col md:flex-row gap-8 bg-white">
              <div className="w-full md:w-1/3 space-y-4">
                <div 
                  onClick={() => inspectNote.coverImageUrl && setImageView(`${backendUrl}${inspectNote.coverImageUrl}`)}
                  className="w-full h-80 bg-gray-50 rounded-xl border border-gray-200 p-2 flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors"
                >
                  <img src={inspectNote.coverImageUrl ? `${backendUrl}${inspectNote.coverImageUrl}` : "https://placehold.co/300x400/e2e8f0/475569?text=Cover"} alt="Cover" className="max-h-full object-contain" />
                </div>
                
                {inspectNote.sampleImageUrls && inspectNote.sampleImageUrls.length > 0 && (
                  <div>
                    <h4 className="font-bold text-gray-700 mb-2">Sample Images ({inspectNote.sampleImageUrls.length})</h4>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {inspectNote.sampleImageUrls.map((img, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => setImageView(`${backendUrl}${img}`)}
                          className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg border border-gray-200 p-1 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all"
                        >
                          <img src={`${backendUrl}${img}`} alt={`Sample ${idx}`} className="w-full h-full object-cover rounded" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full md:w-2/3 flex flex-col">
                <div className="mb-2">
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Category ID: {inspectNote.categoryId}
                  </span>
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-2">{inspectNote.title}</h3>
                <p className="text-2xl font-bold text-green-600 mb-6">{inspectNote.price} TL</p>
                
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 mb-8 flex-1">
                  <h4 className="font-bold text-gray-800 mb-2">Detailed Description</h4>
                  <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{inspectNote.content}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <button
                    onClick={() => setPdfView(inspectNote.demoPdfUrl)}
                    disabled={!inspectNote.demoPdfUrl}
                    className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-bold py-3 rounded-xl transition-colors border border-yellow-200 flex justify-center items-center gap-2"
                  >
                    📄 View Demo PDF
                  </button>
                  <button
                    onClick={() => setPdfView(inspectNote.originalPdfUrl)}
                    disabled={!inspectNote.originalPdfUrl}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-3 rounded-xl transition-colors border border-indigo-200 flex justify-center items-center gap-2"
                  >
                    📄 View Original PDF
                  </button>
                </div>

                <div className="flex gap-4 pt-6 border-t border-gray-100 mt-auto">
                  <button
                    onClick={() => handleAction(inspectNote.id, 'reject')}
                    className="flex-1 bg-red-100 hover:bg-red-600 text-red-700 hover:text-white font-black py-4 rounded-xl transition-all border border-red-200 hover:border-red-600 text-lg"
                  >
                    ❌ REJECT
                  </button>
                  <button
                    onClick={() => handleAction(inspectNote.id, 'approve')}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-xl transition-all shadow-lg text-lg"
                  >
                    ✅ APPROVE
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {pdfView && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/90 p-4 backdrop-blur-md">
          <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden shadow-2xl relative">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
              <button 
                onClick={() => setPdfView(null)} 
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold transition-colors"
              >
                <span>&larr;</span> Back to Inspector
              </button>
              <h2 className="text-lg font-bold text-gray-800">PDF Viewer</h2>
            </div>
            <div className="flex-1 w-full h-full bg-gray-200">
              <iframe src={`${backendUrl}${pdfView}#toolbar=0`} className="w-full h-full border-0" title="PDF Viewer"></iframe>
            </div>
          </div>
        </div>
      )}

      {imageView && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/95 p-4 backdrop-blur-sm cursor-pointer"
          onClick={() => setImageView(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center justify-center">
            <button
              onClick={(e) => { e.stopPropagation(); setImageView(null); }}
              className="absolute -top-12 right-0 text-gray-400 hover:text-white font-bold text-4xl transition-colors"
            >
              ✕
            </button>
            <img 
              src={imageView} 
              alt="Expanded Preview" 
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-slate-700 cursor-default" 
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanelPage;