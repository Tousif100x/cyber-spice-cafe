import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, Package, Clock, User, Phone, MapPin, ArrowLeft } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "https://cyber-spice-cafe.onrender.com";

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/orders`);
      setOrders(res.data);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setError('Could not connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'delivered': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#1d6cf0]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Header */}
      <div className="border-b border-gray-800 bg-[#111] p-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors text-blue-400"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold text-blue-400 tracking-tight">Cyber Spice Admin</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">Live Updates</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
            <span className="text-lg">⚠️</span> {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-[#0a0a0a] rounded-2xl p-16 text-center border border-gray-800 shadow-2xl">
            <Package className="h-20 w-20 text-[#1d6cf0] mx-auto mb-6 opacity-50" />
            <h3 className="text-3xl font-bold text-white mb-3">No Orders Yet</h3>
            <p className="text-gray-500 text-lg max-w-md mx-auto">
              When customers place orders via the chatbot, they will appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => (
              <div key={order._id} className="bg-[#1d6cf0] rounded-2xl shadow-xl overflow-hidden transform hover:scale-[1.02] transition-all duration-200 border border-white/10">
                {/* Card Header */}
                <div className="bg-black/20 px-5 py-3 border-b border-white/10 flex justify-between items-center">
                  <span className="font-mono text-xs text-white/70 tracking-tighter">#{order._id.slice(-6).toUpperCase()}</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="p-6">
                  {/* Items Section */}
                  <div className="mb-6">
                    <h4 className="text-[11px] font-black text-white/50 uppercase tracking-[2px] mb-3">Order Items</h4>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-white">{item.quantity}x {item.name}</span>
                          <span className="text-xs font-medium text-white/80">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-end">
                      <span className="text-xs font-bold text-white/60 uppercase">Total Amount</span>
                      <span className="text-2xl font-black text-white">₹{order.totalAmount}</span>
                    </div>
                  </div>

                  {/* Customer Details Section */}
                  <div className="bg-white/10 rounded-xl p-4 space-y-3 border border-white/5">
                    <h4 className="text-[10px] font-black text-white uppercase tracking-[1px] flex items-center gap-2">
                      {order.customerDetails?.fulfillmentType === 'Delivery' ? '🛵 Delivery' : '🏃 Pickup'}
                    </h4>
                    
                    <div className="space-y-2">
                      {order.customerDetails?.contactName && (
                        <div className="flex items-center gap-2 text-xs text-white">
                          <User className="h-3 w-3 text-white/60" />
                          <span className="font-medium">{order.customerDetails.contactName}</span>
                        </div>
                      )}
                      
                      {order.customerDetails?.contactNumber && (
                        <div className="flex items-center gap-2 text-xs text-white">
                          <Phone className="h-3 w-3 text-white/60" />
                          <span className="font-medium">{order.customerDetails.contactNumber}</span>
                        </div>
                      )}

                      {order.customerDetails?.address && (
                        <div className="flex items-start gap-2 text-xs text-white">
                          <MapPin className="h-3 w-3 text-white/60 mt-0.5" />
                          <span className="font-medium leading-relaxed">{order.customerDetails.address}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-white/40 pt-2 border-t border-white/5">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(order.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
