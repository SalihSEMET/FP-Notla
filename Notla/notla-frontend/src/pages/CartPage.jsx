import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const backendUrl = "http://localhost:5261";

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    const token = localStorage.getItem("notla_token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get(`${backendUrl}/api/Cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load cart data.");
      setLoading(false);
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    const token = localStorage.getItem("notla_token");
    if (!token) return;

    try {
      await axios.delete(`${backendUrl}/api/Cart/Remove/${cartItemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCart();
    } catch (err) {
      console.error("Failed to remove item", err);
    }
  };

  if (loading) return <div className="text-center py-20 text-2xl font-bold text-blue-500 animate-pulse">Loading Cart...</div>;
  if (error) return <div className="text-center py-20 text-2xl text-red-500">{error}</div>;

  if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added any notes to your cart yet.</p>
        <Link to="/" className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition-colors">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-4">
          {cart.cartItems.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 relative pr-12 hover:shadow-md transition-shadow">
              
              <button 
                onClick={() => handleRemoveItem(item.id)}
                className="absolute top-4 right-4 text-gray-300 hover:text-red-600 hover:bg-red-50 w-8 h-8 flex items-center justify-center rounded-full transition-colors font-bold text-lg"
                title="Remove from cart"
              >
                ✕
              </button>

              <div className="w-24 h-32 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={item.coverImageUrl ? `${backendUrl}${item.coverImageUrl}` : "https://placehold.co/150x200/e2e8f0/475569?text=No+Image"}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">{item.title}</h3>
                <span className="text-xl font-black text-blue-600">{item.price} TL</span>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full lg:w-96">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
            <div className="flex justify-between items-center mb-4 text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold">{cart.totalPrice} TL</span>
            </div>
            <div className="border-t border-gray-100 my-4"></div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-3xl font-black text-blue-600">{cart.totalPrice} TL</span>
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors shadow-lg">
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;