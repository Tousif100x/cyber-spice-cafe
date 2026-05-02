import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Package, Clock, User, Phone, MapPin } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "https://cyber-spice-cafe.onrender.com";


export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    // Poll for new orders every 10 seconds
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/orders`);
      setOrders(res.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'bg-yellow-100 text-yellow-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center h-[calc(100vh-64px)]"><Loader2 className="h-10 w-10 animate-spin text-orange-500" /></div>;
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Live Order Dashboard</h1>
        
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900">No Orders Yet</h3>
            <p className="text-gray-500 mt-2">When customers place orders via the chatbot, they will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                  <span className="font-mono text-sm text-gray-500">#{order._id.slice(-6).toUpperCase()}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="p-5">
                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Order Items</h4>
                    <ul className="space-y-2">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="flex justify-between text-sm">
                          <span className="font-medium text-gray-900">{item.quantity}x {item.name}</span>
                          <span className="text-gray-600">₹{item.price * item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between font-bold text-lg text-gray-900">
                      <span>Total:</span>
                      <span>₹{order.totalAmount}</span>
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-4 space-y-3">
                    <h4 className="text-sm font-bold text-orange-800 uppercase tracking-wider flex items-center">
                      {order.customerDetails?.fulfillmentType === 'Delivery' ? '🛵 Delivery Details' : '🏃 Pickup / Dine-In'}
                    </h4>
                    
                    {order.customerDetails?.contactName && (
                      <div className="flex items-start space-x-2 text-sm text-gray-700">
                        <User className="h-4 w-4 text-orange-500 mt-0.5" />
                        <span>{order.customerDetails.contactName}</span>
                      </div>
                    )}
                    
                    {order.customerDetails?.contactNumber && (
                      <div className="flex items-start space-x-2 text-sm text-gray-700">
                        <Phone className="h-4 w-4 text-orange-500 mt-0.5" />
                        <span>{order.customerDetails.contactNumber}</span>
                      </div>
                    )}

                    {order.customerDetails?.address && (
                      <div className="flex items-start space-x-2 text-sm text-gray-700">
                        <MapPin className="h-4 w-4 text-orange-500 mt-0.5" />
                        <span>{order.customerDetails.address}</span>
                      </div>
                    )}

                    <div className="flex items-start space-x-2 text-sm text-gray-500 pt-2 border-t border-orange-200">
                      <Clock className="h-4 w-4 mt-0.5" />
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
