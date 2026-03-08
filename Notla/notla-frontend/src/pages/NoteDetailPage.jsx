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

  const backendUrl = "http://localhost:5261";

  useEffect(() => {
    axios.get(`${backendUrl}/api/Notes/${id}`)
      .then((response) => {
        setNote(response.data);
        if (response.data.coverImageUrl) {
            setMainImage(`${backendUrl}${response.data.coverImageUrl}`);
        } else {
            setMainImage("https://placehold.co/600x800/e2e8f0/475569?text=Note+Cover+Image");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching note details:", error);
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem("notla_token"); 

    if (!token) {
      alert("Please log in to add items to your cart.");
      navigate("/login");
      return;
    }

    setIsAddingToCart(true);
    setCartMessage("");

    try {
      await axios.post(
        `${backendUrl}/api/Cart/Add/${id}`, 
        null,
        {
          headers: {
            Authorization: `Bearer ${token}` 
          }
        }
      );
      
      setCartMessage("✅ Successfully added to cart!");
      
      setTimeout(() => setCartMessage(""), 3000);
      
    } catch (error) {
      console.error("Add to cart error:", error);
      const errorMessage = error.response && error.response.data 
        ? error.response.data 
        : "Could not add to cart. An unexpected error occurred.";
        
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
    <div className="max-w-6xl mx-auto py-8 px-4">
      <Link to="/" className="text-blue-500 hover:underline mb-6 inline-block">
        &larr; Back to Home
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        
        {/* ================= LEFT COLUMN: IMAGE GALLERY ================= */}
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

        {/* ================= RIGHT COLUMN: PRODUCT INFO ================= */}
        <div className="flex flex-col">
          <div className="mb-2">
            <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
              Category: {note.categoryId}
            </span>
          </div>
          
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4">{note.title}</h1>
          
          <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
            <span className="flex items-center">⭐ <b className="ml-1 text-gray-800">{note.rating || "0.0"}</b> / 5</span>
            <span className="flex items-center">👁️ <b className="ml-1 text-gray-800">{note.viewCount || 0}</b> Views</span>
            <span className="flex items-center">🛒 <b className="ml-1 text-gray-800">{note.salesCount || 0}</b> Sales</span>
          </div>

          <div className="mb-6">
            <span className="text-4xl font-black text-blue-600">{note.price} TL</span>
          </div>

          <div className="mb-8 flex-1">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Note Description</h3>
            <p className="text-gray-600 leading-relaxed">
              {note.content || "No detailed description has been provided for this note yet. However, we are confident that its content will be highly valuable to you."}
            </p>
          </div>

          <div className="flex flex-col space-y-3 mt-auto">
            {}
            {cartMessage && (
              <div className={`text-center py-2 rounded-lg font-bold ${cartMessage.includes("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {cartMessage}
              </div>
            )}

            <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl transition-colors flex justify-center items-center">
              📄 Review Free Demo PDF
            </button>
            
            {}
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
    </div>
  );
}

export default NoteDetailPage;