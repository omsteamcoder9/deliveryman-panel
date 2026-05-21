// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { deliveryBoyAPI } from '../api/deliveryBoy';
import { 
  Truck, 
  LogOut, 
  Package, 
  CheckCircle, 
  Clock, 
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { deliveryBoy, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todayDeliveries: 0,
    pendingOrders: 0,
    totalDeliveries: 0
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Fetch dashboard data
  const fetchDashboardData = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      // Get stats
      const statsResponse = await deliveryBoyAPI.getStats();
      setStats(statsResponse.data.stats);
      
      // Get assigned orders
      const ordersResponse = await deliveryBoyAPI.getMyOrders();
      setOrders(ordersResponse.data.orders || []);
      
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handle pickup
  const handlePickup = async (orderId) => {
    try {
      setUpdatingOrderId(orderId);
      await deliveryBoyAPI.markPickedUp(orderId);
      toast.success('Order marked as picked up!');
      fetchDashboardData(true);
    } catch (error) {
      console.error('Pickup error:', error);
      toast.error(error.response?.data?.message || 'Failed to mark as picked up');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Handle delivery
  const handleDeliver = async (orderId) => {
    const confirm = window.confirm('Mark this order as delivered?');
    if (!confirm) return;
    
    try {
      setUpdatingOrderId(orderId);
      await deliveryBoyAPI.markDelivered(orderId);
      toast.success('Order delivered successfully!');
      fetchDashboardData(true);
    } catch (error) {
      console.error('Delivery error:', error);
      toast.error(error.response?.data?.message || 'Failed to mark as delivered');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      assigned: { color: 'bg-blue-100 text-blue-800', label: 'Assigned' },
      picked_up: { color: 'bg-yellow-100 text-yellow-800', label: 'Picked Up' },
      delivered: { color: 'bg-green-100 text-green-800', label: 'Delivered' }
    };
    const badge = badges[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="flex justify-between items-center px-4 py-3 md:px-6">
          <div className="flex items-center gap-2">
            <Truck className="text-red-500" size={28} />
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-800">Delivery Dashboard</h1>
              <p className="text-xs text-gray-500">Welcome back, {deliveryBoy?.name}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 md:px-4 rounded-lg flex items-center gap-2 transition text-sm"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="p-4 md:p-6">
        {/* Refresh Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow text-gray-600 hover:bg-gray-50 disabled:opacity-50 text-sm"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Today's Deliveries</p>
                <p className="text-2xl font-bold text-gray-800">{stats.todayDeliveries}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending Orders</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Deliveries</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalDeliveries}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Package className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Boy Info */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <p className="text-white/80 text-sm">Your Information</p>
              <p className="font-semibold text-lg">{deliveryBoy?.name}</p>
              <div className="flex flex-wrap gap-3 mt-1 text-sm text-white/90">
                <span className="flex items-center gap-1">
                  <Phone size={14} /> {deliveryBoy?.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Mail size={14} /> {deliveryBoy?.email}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={14} /> Ward: {deliveryBoy?.wardName || `Ward ${deliveryBoy?.wardId}`}
                </span>
              </div>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-lg">
              <p className="text-sm">Vehicle: {deliveryBoy?.vehicleType || 'Bike'}</p>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ShoppingBag size={20} />
            Your Assigned Orders
          </h2>

          {orders.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
              <Package className="mx-auto text-gray-400 mb-3" size={48} />
              <h3 className="text-lg font-medium text-gray-700">No orders assigned</h3>
              <p className="text-gray-500 text-sm mt-1">
                Orders will appear here when admin assigns them to you.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Order Header */}
                  <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div>
                        <p className="text-xs text-gray-500">Order #{order.orderId || order._id?.slice(-8)}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Placed: {formatDate(order.createdAt)}
                        </p>
                      </div>
                      {getStatusBadge(order.deliveryStatus)}
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="p-4 border-b border-gray-100">
                    <p className="font-medium text-gray-800 mb-2">Customer Details</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Name:</span>
                        <span className="font-medium">{order.shippingAddress?.name || 'Customer'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Phone:</span>
                        <a href={`tel:${order.shippingAddress?.phone}`} className="text-blue-600 hover:underline">
                          {order.shippingAddress?.phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 col-span-full">
                        <span className="text-gray-500">Address:</span>
                        <span className="text-gray-700">
                          {order.shippingAddress?.street}, {order.shippingAddress?.city}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Summary */}
                  <div className="p-4 border-b border-gray-100">
                    <p className="font-medium text-gray-800 mb-2">Items ({order.products?.length || 0})</p>
                    <div className="space-y-1">
                      {(order.products || []).slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {item.quantity}x {item.name}
                            {item.variantName && ` (${item.variantName})`}
                          </span>
                          <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      ))}
                      {order.products?.length > 3 && (
                        <p className="text-xs text-gray-400">+{order.products.length - 3} more items</p>
                      )}
                    </div>
                  </div>

                  {/* Total Amount */}
                  <div className="p-4 bg-gray-50 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-500">Total Amount</p>
                      <p className="text-xl font-bold text-gray-800">{formatCurrency(order.finalAmount)}</p>
                      <p className="text-xs text-gray-500">Payment: {order.paymentMethod?.toUpperCase()} | {order.paymentStatus}</p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {order.deliveryStatus === 'assigned' && (
                        <button
                          onClick={() => handlePickup(order._id)}
                          disabled={updatingOrderId === order._id}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                        >
                          {updatingOrderId === order._id ? (
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          ) : (
                            <Package size={16} />
                          )}
                          Picked Up
                        </button>
                      )}
                      
                      {order.deliveryStatus === 'picked_up' && (
                        <button
                          onClick={() => handleDeliver(order._id)}
                          disabled={updatingOrderId === order._id}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                        >
                          {updatingOrderId === order._id ? (
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          ) : (
                            <CheckCircle size={16} />
                          )}
                          Delivered
                        </button>
                      )}
                      
                      <button
                        onClick={() => navigate(`/orders/${order._id}`)}
                        className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-sm flex items-center gap-1"
                      >
                        Details
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;