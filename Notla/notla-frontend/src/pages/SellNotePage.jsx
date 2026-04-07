import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function SellNotePage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [demoPdf, setDemoPdf] = useState(null);
  const [originalPdf, setOriginalPdf] = useState(null);
  const [sampleImages, setSampleImages] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();
  const backendUrl = "http://localhost:5261";

  const handleMultipleFiles = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 15) {
      alert("You can upload a maximum of 15 sample photos.");
      return;
    }
    setSampleImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("notla_token");
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setMessage("");
    setIsSuccess(false);

    const formData = new FormData();
    formData.append("Title", title);
    formData.append("Content", content);
    formData.append("Price", price);
    formData.append("CategoryId", categoryId);
    
    if (coverImage) formData.append("CoverImage", coverImage);
    if (demoPdf) formData.append("DemoPdf", demoPdf);
    if (originalPdf) formData.append("OriginalPdf", originalPdf);
    
    sampleImages.forEach((file) => {
      formData.append("SampleImages", file);
    });

    try {
      await axios.post(`${backendUrl}/api/Notes`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setIsSuccess(true);
      setMessage("✅ Your note has been successfully submitted and is awaiting approval!");
      
      setTimeout(() => {
        navigate("/");
      }, 3000);

    } catch (err) {
      setIsSuccess(false);
      setMessage("❌ " + (err.response?.data || "Failed to submit the note. Please check your inputs."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-blue-600 px-8 py-10 text-white text-center">
          <h1 className="text-4xl font-black mb-2 tracking-wide">Sell Your Note</h1>
          <p className="text-blue-100 text-lg">Share your knowledge and start earning.</p>
        </div>

        <div className="p-8">
          {message && (
            <div className={`mb-8 p-4 rounded-xl font-bold text-center ${isSuccess ? "bg-green-100 text-green-800 border border-green-200" : "bg-red-100 text-red-800 border border-red-200"}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Note Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Price (TL)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Category ID</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Detailed Description</label>
              <textarea
                required
                rows="4"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
              ></textarea>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-6">
              <h3 className="text-lg font-black text-gray-800 border-b pb-2">Files & Media</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Cover Image (Required)</label>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => setCoverImage(e.target.files[0])}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Sample Images (Max 15)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleMultipleFiles}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300 cursor-pointer"
                  />
                  {sampleImages.length > 0 && <p className="text-xs text-green-600 mt-2 font-bold">{sampleImages.length} images selected</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Demo PDF (Required)</label>
                  <input
                    type="file"
                    accept="application/pdf"
                    required
                    onChange={(e) => setDemoPdf(e.target.files[0])}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Original PDF (Required)</label>
                  <input
                    type="file"
                    accept="application/pdf"
                    required
                    onChange={(e) => setOriginalPdf(e.target.files[0])}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl text-white font-black text-lg shadow-lg transition-all ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 hover:shadow-xl"}`}
            >
              {loading ? "Uploading & Submitting..." : "Submit Note for Sale"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SellNotePage;