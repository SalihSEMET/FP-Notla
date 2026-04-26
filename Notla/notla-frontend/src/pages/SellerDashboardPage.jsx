import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

function SellerDashboardPage() {
  const [stats, setStats] = useState(null);
  const [notesData, setNotesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const backendUrl = "http://localhost:5261";

  const COLORS = ['#3b82f6', '#10b981', '#f43f5e', '#8b5cf6', '#f59e0b'];

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("notla_token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const [statsRes, notesRes] = await Promise.all([
          axios.get(`${backendUrl}/api/User/DashboardStats`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${backendUrl}/api/Notes/MySellingNotes`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setStats(statsRes.data);
        
        const formattedNotes = notesRes.data.map(note => ({
          name: note.title.length > 15 ? note.title.substring(0, 15) + '...' : note.title,
          views: note.viewCount || 0,
          sales: note.salesCount || 0,
          price: note.price || 0,
          rating: note.rating || 0
        }));

        setNotesData(formattedNotes);
        setLoading(false);
      } catch (err) {
        setError("Failed to load dashboard statistics.");
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  if (loading) return <div className="text-center py-20 text-2xl font-bold text-blue-500 animate-pulse">Loading Advanced Dashboard...</div>;
  if (error) return <div className="text-center py-20 text-2xl text-red-500">{error}</div>;

  const topViewedNotes = [...notesData].sort((a, b) => b.views - a.views).slice(0, 5);
  const topSellingNotes = [...notesData].sort((a, b) => b.sales - a.sales).slice(0, 5).filter(n => n.sales > 0);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 relative min-h-screen">
      
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl shadow-2xl p-8 mb-10 text-white flex flex-col md:flex-row justify-between items-center border border-blue-600 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl font-black mb-3 flex items-center gap-3">
            <span className="text-5xl">📈</span> Performance Hub
          </h1>
          <p className="text-blue-100 font-medium text-lg">Real-time metrics and deep insights for your business.</p>
        </div>
        <div className="mt-6 md:mt-0 relative z-10 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20">
          <span className="text-blue-100 font-bold uppercase tracking-wider text-sm">Status</span>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="font-black text-xl">All Systems Operational</span>
          </div>
        </div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-green-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="text-gray-400 font-bold mb-2 flex items-center gap-2 uppercase tracking-wider text-sm">
            <span>💰</span> Total Earnings
          </div>
          <div className="text-5xl font-black text-gray-900">{stats.totalEarnings.toFixed(2)} <span className="text-2xl text-green-500">TL</span></div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="text-gray-400 font-bold mb-2 flex items-center gap-2 uppercase tracking-wider text-sm">
            <span>🛒</span> Total Sales
          </div>
          <div className="text-5xl font-black text-gray-900">{stats.totalSales} <span className="text-2xl text-blue-500">Units</span></div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="text-gray-400 font-bold mb-2 flex items-center gap-2 uppercase tracking-wider text-sm">
            <span>📚</span> Active Notes
          </div>
          <div className="text-5xl font-black text-gray-900">{stats.activeNotesCount} <span className="text-2xl text-indigo-500">Live</span></div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-rose-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="text-gray-400 font-bold mb-2 flex items-center gap-2 uppercase tracking-wider text-sm">
            <span>👁️</span> Total Views
          </div>
          <div className="text-5xl font-black text-gray-900">{stats.totalViews} <span className="text-2xl text-rose-500">Hits</span></div>
        </div>
      </div>

      {notesData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-blue-500">📊</span> Top 5 Most Viewed Notes
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topViewedNotes} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }} 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="views" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-green-500">🎯</span> Sales Distribution
            </h2>
            <div className="h-80 flex items-center justify-center">
              {topSellingNotes.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topSellingNotes}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="sales"
                      stroke="none"
                    >
                      {topSellingNotes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-gray-400 font-bold">
                  <span className="text-4xl block mb-2">🛒</span>
                  No sales data yet to generate chart.
                </div>
              )}
            </div>
          </div>

        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 text-center">
          <span className="text-6xl block mb-4">📈</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No data available yet</h2>
          <p className="text-gray-500">Upload your first note to start seeing advanced analytics and charts here.</p>
        </div>
      )}

    </div>
  );
}

export default SellerDashboardPage;