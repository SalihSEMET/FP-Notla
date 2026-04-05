import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [discountCode, setDiscountCode] = useState("");
  const [appliedCode, setAppliedCode] = useState("");
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

  const handleRemoveItem = async (cartItemId) => {
    const token = localStorage.getItem("notla_token");
    if (!token) return;

    try {
      await axios.delete(`${backendUrl}/api/Cart/Remove/${cartItemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Ürün silinince indirim kodunu da sıfırla
      setDiscountedTotal(null);
      setAppliedCode("");
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  // 🚀 VİZYON: İndirim Kodunu Önizleme Mekanizması
  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    
    setIsApplying(true);
    setDiscountMessage("");
    setCheckoutMessage("");

    try {
      const token = localStorage.getItem("notla_token");
      const response = await axios.get(`${backendUrl}/api/Orders/Preview?discountCode=${encodeURIComponent(discountCode.trim())}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setDiscountedTotal(response.data.newTotal);
      setAppliedCode(discountCode.trim());
      setDiscountMessage("✅ Discount applied successfully!");
      
    } catch (err) {
      const d = err.response?.data;
      const msg = d ? (d.Message || d.message || d.title || (typeof d === 'string' ? d : "Invalid code.")) : "Invalid code.";
      setDiscountMessage(`❌ ${msg}`);
      setDiscountedTotal(null);
      setAppliedCode("");
    } finally {
      setIsApplying(false);
    }
  };

  // 🛒 Checkout İşlemi
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
      const codeToUse = appliedCode || discountCode.trim();
      let url = `${backendUrl}/api/Orders/Checkout`;
      if (codeToUse) {
        url += `?discountCode=${encodeURIComponent(codeToUse)}`;
      }

      await axios.post(url, null, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCheckoutMessage("✅ Order successfully completed! Notes added to your library.");
      setDiscountCode("");
      setAppliedCode("");
      setDiscountedTotal(null);
      
      setTimeout(() => {
        setCheckoutMessage("");
        fetchCart();
      }, 3000);

    } catch (err) {
      // 🚀 OBJECT OBJECT ÇÖZÜCÜ
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

            {/* 🚀 APPLY BUTONLU DİNAMİK KUTU */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Discount Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => {
                    setDiscountCode(e.target.value.toUpperCase());
                    if (appliedCode) {
                      setAppliedCode("");
                      setDiscountedTotal(null);
                      setDiscountMessage("");
                    }
                  }}
                  placeholder="Enter code here"
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase transition-colors font-semibold"
                  disabled={isCheckingOut || isApplying}
                />
                <button
                  onClick={handleApplyDiscount}
                  disabled={isApplying || !discountCode.trim() || appliedCode === discountCode.trim()}
                  className="bg-gray-800 text-white font-bold px-5 py-3 rounded-lg hover:bg-gray-900 transition-colors disabled:bg-gray-300 shadow-sm"
                >
                  {isApplying ? "..." : "Apply"}
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
            
            {/* 🚀 ÜSTÜ ÇİZİLİ FİYAT VE YENİ FİYAT ANİMASYONU */}
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