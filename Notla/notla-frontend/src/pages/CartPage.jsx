import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [discountInput, setDiscountInput] = useState("");
  const [appliedCodes, setAppliedCodes] = useState([]);
  const [discountedTotal, setDiscountedTotal] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [discountMessage, setDiscountMessage] = useState("");

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  
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

  const handleRemoveItem = async (e, cartItemId) => {
    e.stopPropagation();
    const token = localStorage.getItem("notla_token");
    if (!token) return;

    try {
      await axios.delete(`${backendUrl}/api/Cart/Remove/${cartItemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDiscountedTotal(null);
      setAppliedCodes([]);
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyDiscount = async () => {
    if (!discountInput.trim()) return;
    const code = discountInput.trim().toUpperCase();
    
    if (appliedCodes.includes(code)) {
        setDiscountMessage("❌ This code is already applied!");
        return;
    }

    setIsApplying(true);
    setDiscountMessage("");
    setCheckoutMessage("");

    const newCodes = [...appliedCodes, code];

    try {
      const token = localStorage.getItem("notla_token");
      const queryParams = newCodes.map(c => `discountCodes=${encodeURIComponent(c)}`).join('&');
      
      const response = await axios.get(`${backendUrl}/api/Orders/Preview?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setDiscountedTotal(response.data.newTotal);
      setAppliedCodes(newCodes);
      setDiscountInput("");
      setDiscountMessage("✅ Discount applied successfully!");
      
    } catch (err) {
      const d = err.response?.data;
      const msg = d ? (d.Message || d.message || d.title || (typeof d === 'string' ? d : "Invalid code.")) : "Invalid code.";
      setDiscountMessage(`❌ ${msg}`);
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveDiscount = async (codeToRemove) => {
      const newCodes = appliedCodes.filter(c => c !== codeToRemove);
      
      if (newCodes.length === 0) {
          setAppliedCodes([]);
          setDiscountedTotal(null);
          setDiscountMessage("");
          return;
      }

      setIsApplying(true);
      try {
        const token = localStorage.getItem("notla_token");
        const queryParams = newCodes.map(c => `discountCodes=${encodeURIComponent(c)}`).join('&');
        
        const response = await axios.get(`${backendUrl}/api/Orders/Preview?${queryParams}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setDiscountedTotal(response.data.newTotal);
        setAppliedCodes(newCodes);
        setDiscountMessage("✅ Coupon removed and total updated.");
      } catch (err) {
         setDiscountMessage("❌ Failed to update cart.");
      } finally {
        setIsApplying(false);
      }
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem("notla_token");
    if (!token) {
      navigate("/login");
      return;
    }

    setIsCheckingOut(true);
    setCheckoutMessage("");
    setDiscountMessage("");

    try {
      let url = `${backendUrl}/api/Orders/Checkout`;
      if (appliedCodes.length > 0) {
          const queryParams = appliedCodes.map(c => `discountCodes=${encodeURIComponent(c)}`).join('&');
          url += `?${queryParams}`;
      }

      await axios.post(url, null, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCheckoutMessage("✅ Order successfully completed! Notes added to your library.");
      setDiscountInput("");
      setAppliedCodes([]);
      setDiscountedTotal(null);
      
      setTimeout(() => {
        setCheckoutMessage("");
        fetchCart();
      }, 3000);

    } catch (err) {
      const d = err.response?.data;
      const errMsg = d ? (d.Message || d.message || d.title || (typeof d === 'string' ? d : "Unexpected error.")) : "Checkout failed.";
      setCheckoutMessage(`❌ ${errMsg}`);
      setTimeout(() => setCheckoutMessage(""), 5000);
    } finally {
      setIsCheckingOut(false);
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
            <div 
              key={item.id} 
              onClick={() => navigate(`/note/${item.noteId}`)}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 relative pr-12 hover:shadow-md transition-shadow cursor-pointer"
            >
              
              <button 
                onClick={(e) => handleRemoveItem(e, item.id)}
                className="absolute top-4 right-4 text-gray-300 hover:text-red-600 hover:bg-red-50 w-8 h-8 flex items-center justify-center rounded-full transition-colors font-bold text-lg z-10"
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
                <h3 className="text-lg font-bold text-gray-800 hover:text-blue-600 transition-colors">{item.title}</h3>
                <span className="text-xl font-black text-blue-600">{item.price} TL</span>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full lg:w-96">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Discount Codes</label>
              
              {appliedCodes.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {appliedCodes.map(code => (
                        <div key={code} className="bg-blue-50 text-blue-800 border border-blue-200 font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm">
                            <span>{code}</span>
                            <button onClick={() => handleRemoveDiscount(code)} className="text-blue-400 hover:text-red-500 transition-colors">✕</button>
                        </div>
                    ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value.toUpperCase())}
                  placeholder="Enter code here"
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase transition-colors font-semibold"
                  disabled={isCheckingOut || isApplying}
                />
                <button
                  onClick={handleApplyDiscount}
                  disabled={isApplying || !discountInput.trim()}
                  className="bg-gray-800 text-white font-bold px-5 py-3 rounded-lg hover:bg-gray-900 transition-colors disabled:bg-gray-300 shadow-sm"
                >
                  {isApplying ? "..." : "Add"}
                </button>
              </div>
              {discountMessage && (
                <div className={`mt-2 text-sm font-bold ${discountMessage.includes("✅") ? "text-green-600" : "text-red-600"}`}>
                  {discountMessage}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mb-4 text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold">{cart.totalPrice} TL</span>
            </div>
            <div className="border-t border-gray-100 my-4"></div>
            
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <div className="flex flex-col items-end">
                {discountedTotal !== null ? (
                  <>
                    <span className="text-lg text-gray-400 line-through font-semibold">{cart.totalPrice} TL</span>
                    <span className="text-3xl font-black text-green-600">{discountedTotal} TL</span>
                  </>
                ) : (
                  <span className="text-3xl font-black text-blue-600">{cart.totalPrice} TL</span>
                )}
              </div>
            </div>

            {checkoutMessage && (
              <div className={`mb-4 text-center py-3 px-3 rounded-xl font-bold text-sm shadow-sm ${checkoutMessage.includes("✅") ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"}`}>
                {checkoutMessage}
              </div>
            )}

            <button 
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className={`w-full text-white font-bold py-4 rounded-xl transition-all shadow-lg flex justify-center items-center text-lg ${isCheckingOut ? 'bg-blue-400 cursor-not-allowed scale-95' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30'}`}
            >
              {isCheckingOut ? "Processing Order..." : "Proceed to Checkout"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;