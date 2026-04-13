import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

function AdminCategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  const navigate = useNavigate();
  const backendUrl = "http://localhost:5261";

  useEffect(() => {
    checkAdminAccess();
    fetchCategories();
  }, []);

  const checkAdminAccess = () => {
    const token = localStorage.getItem("notla_token");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const decodedToken = jwtDecode(token);
      const roleClaim = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      if (roleClaim !== "Admin" && !(Array.isArray(roleClaim) && roleClaim.includes("Admin"))) {
        navigate("/");
      }
    } catch (error) {
      navigate("/login");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/Categories`);
      setCategories(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load categories.");
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const token = localStorage.getItem("notla_token");
    setIsSubmitting(true);
    setActionMessage("");

    try {
      await axios.post(`${backendUrl}/api/Categories`, 
        { name: newCategoryName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setActionMessage("✅ Category successfully added!");
      setNewCategoryName("");
      fetchCategories();
      setTimeout(() => setActionMessage(""), 3000);
    } catch (err) {
      setActionMessage("❌ Failed to add category.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if(!window.confirm(`Are you sure you want to delete the category "${name}"? This might affect notes linked to it.`)) return;

    const token = localStorage.getItem("notla_token");
    try {
      await axios.delete(`${backendUrl}/api/Categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setActionMessage("✅ Category successfully deleted!");
      fetchCategories();
      setTimeout(() => setActionMessage(""), 3000);
    } catch (err) {
      alert("Failed to delete category.");
    }
  };

  if (loading) return <div className="text-center py-20 text-2xl font-bold text-indigo-500 animate-pulse">Loading Categories...</div>;
  if (error) return <div className="text-center py-20 text-2xl text-red-500">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
            <span className="text-indigo-600">📂</span> Category Management
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Add, review, or remove marketplace categories.</p>
        </div>
        <Link to="/admin" className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-xl transition-colors">
          &larr; Back to Command Center
        </Link>
      </div>

      {actionMessage && (
        <div className={`mb-8 p-4 rounded-xl font-bold text-center ${actionMessage.includes("✅") ? "bg-green-100 text-green-800 border border-green-200" : "bg-red-100 text-red-800 border border-red-200"}`}>
          {actionMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ADD NEW CATEGORY FORM */}
        <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sticky top-6">
                <h2 className="text-xl font-black text-gray-800 mb-6 border-b pb-2">Add New Category</h2>
                <form onSubmit={handleAddCategory} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Category Name</label>
                        <input 
                            type="text" 
                            required 
                            placeholder="e.g. History, Mathematics"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={isSubmitting || !newCategoryName.trim()}
                        className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-md ${isSubmitting || !newCategoryName.trim() ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/30'}`}
                    >
                        {isSubmitting ? "Adding..." : "+ Add Category"}
                    </button>
                </form>
            </div>
        </div>

        {/* CATEGORY LIST */}
        <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-black text-gray-800">Active Categories</h2>
                    <span className="bg-indigo-100 text-indigo-800 font-bold px-3 py-1 rounded-lg text-sm">
                        {categories.length} Total
                    </span>
                </div>
                
                {categories.length === 0 ? (
                    <div className="text-center py-16">
                        <span className="text-5xl mb-4 block">📭</span>
                        <p className="text-gray-500 font-medium text-lg">No categories found in the database.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {categories.map((category) => (
                            <li key={category.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-gray-400 font-mono text-sm">#{category.id}</span>
                                        <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
                                    </div>
                                </div>
                                
                                <button
                                    onClick={() => handleDeleteCategory(category.id, category.name)}
                                    className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors border border-red-100 shadow-sm opacity-0 group-hover:opacity-100"
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}

export default AdminCategoryPage;