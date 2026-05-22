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
  RefreshCw,
  ShoppingBag,
  Eye,
  XCircle,
  CheckSquare,
  User,
  Calendar,
  Car,
  Hash
} from 'lucide-react';
import { FaTruck, FaClipboardList, FaCheckCircle, FaClock, FaMapMarkerAlt, FaPhone, FaEnvelope, FaTimesCircle, FaHashtag, FaCalendarAlt, FaUser, FaCar } from 'react-icons/fa';import toast from 'react-hot-toast';

const Dashboard = () => {
  const { deliveryBoy, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todayDeliveries: 0,
    pendingOrders: 0,
    totalDeliveries: 0
  });
  const [activeOrders, setActiveOrders] = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [cancelledOrders, setCancelledOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
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
      
      const statsResponse = await deliveryBoyAPI.getStats();
      setStats(statsResponse.data.stats);
      
      const activeResponse = await deliveryBoyAPI.getMyOrders();
      setActiveOrders(activeResponse.data.orders || []);
      
      const historyResponse = await deliveryBoyAPI.getOrderHistory();
      const allHistory = historyResponse.data.orders || [];
      
      const delivered = allHistory.filter(order => order.deliveryStatus === 'delivered' || order.orderStatus === 'delivered');
      const cancelled = allHistory.filter(order => order.orderStatus === 'cancelled');
      
      setDeliveredOrders(delivered);
      setCancelledOrders(cancelled);
      
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

  const handlePickup = async (orderId) => {
    try {
      setUpdatingOrderId(orderId);
      await deliveryBoyAPI.markPickedUp(orderId);
      toast.success('Order marked as picked up!');
      fetchDashboardData(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark as picked up');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleDeliver = async (orderId) => {
    const confirm = window.confirm('✅ Mark this order as delivered?');
    if (!confirm) return;
    
    try {
      setUpdatingOrderId(orderId);
      await deliveryBoyAPI.markDelivered(orderId);
      toast.success('Order delivered successfully!');
      fetchDashboardData(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark as delivered');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status, orderStatus) => {
    if (status === 'delivered' || orderStatus === 'delivered') {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Delivered</span>;
    }
    if (orderStatus === 'cancelled') {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Cancelled</span>;
    }
    const badges = {
      assigned: 'bg-blue-100 text-blue-800',
      picked_up: 'bg-yellow-100 text-yellow-800'
    };
    const labels = {
      assigned: 'Assigned',
      picked_up: 'Picked Up'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  // View Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;

    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
          <div className={`p-4 flex justify-between items-center rounded-t-lg ${order.orderStatus === 'cancelled' ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-[#ff0000] to-[#cc0000]'} text-white`}>
            <div className="flex items-center gap-2">
              {order.orderStatus === 'cancelled' ? <XCircle size={20} /> : <Package size={20} />}
              <h2 className="font-bold text-lg">Order Details</h2>
            </div>
            <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1 transition">
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3 pb-3 border-b">
              <div>
                <p className="text-xs text-gray-500">Order ID</p>
                <p className="font-medium text-sm">{order.orderId || order._id?.slice(-8)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">
                  {order.orderStatus === 'cancelled' ? 'Cancelled On' : 'Placed On'}
                </p>
                <p className="font-medium text-sm">
                  {formatDate(order.orderStatus === 'cancelled' ? (order.cancelledAt || order.updatedAt) : order.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Order Status</p>
                {getStatusBadge(order.deliveryStatus, order.orderStatus)}
              </div>
              <div>
                <p className="text-xs text-gray-500">Payment</p>
                <p className="text-sm font-medium">{order.paymentMethod?.toUpperCase()} | {order.paymentStatus}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Ward Number</p>
                <p className="text-sm font-medium flex items-center gap-1">
                  <FaHashtag className="text-gray-400" size={12} />
                  Ward {order.wardId}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Ward Name</p>
                <p className="text-sm font-medium flex items-center gap-1">
                  <FaMapMarkerAlt className="text-gray-400" size={12} />
                  {order.wardName || `Ward ${order.wardId}`}
                </p>
              </div>
            </div>

            {order.deliveryDeliveredAt && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs text-green-600 font-medium">Delivery Completed</p>
                <p className="text-sm text-green-700">Delivered on: {formatDate(order.deliveryDeliveredAt)}</p>
              </div>
            )}

            {order.orderStatus === 'cancelled' && order.cancellationReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs text-red-600 font-medium">Cancellation Reason</p>
                <p className="text-sm text-red-700">{order.cancellationReason}</p>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-3">
              <h3 className="font-medium text-gray-800 mb-2">Customer Details</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-500">Name:</span> {order.shippingAddress?.name || 'Customer'}</p>
                <p><span className="text-gray-500">Phone:</span> {order.shippingAddress?.phone}</p>
                <p><span className="text-gray-500">Address:</span> {order.shippingAddress?.street}, {order.shippingAddress?.city}</p>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-800 mb-2">Items ({order.products?.length || 0})</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(order.products || []).map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.quantity} x {formatCurrency(item.price)}
                        {item.variantName && ` (${item.variantName})`}
                      </p>
                    </div>
                    <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Amount</span>
                <span className="text-xl font-bold text-[#ff0000]">{formatCurrency(order.finalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="p-4 border-t bg-gray-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Order Card Component
  const OrderCard = ({ order, type, onPickup, onDeliver, onView, isUpdating }) => {
    return (
      <div className="p-4 hover:bg-gray-50 transition-colors">
        <div className="flex flex-wrap justify-between items-start mb-3">
          <div>
            <p className="text-sm font-medium text-gray-900">
              Order #{order.orderId || order._id?.slice(-8)}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {type === 'delivered' 
                ? `Delivered: ${formatDate(order.deliveryDeliveredAt || order.deliveredAt)}`
                : type === 'cancelled'
                ? `Cancelled: ${formatDate(order.cancelledAt || order.updatedAt)}`
                : `Placed: ${formatDate(order.createdAt)}`
              }
            </p>
          </div>
          {getStatusBadge(order.deliveryStatus, order.orderStatus)}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 text-sm bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <FaHashtag className="text-blue-500" size={14} />
            <span className="text-gray-500">Ward Number:</span>
            <span className="font-bold text-blue-700 text-base">#{order.wardId}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-blue-500" size={14} />
            <span className="text-gray-500">Ward Name:</span>
            <span className="font-medium text-gray-700">{order.wardName || `Ward ${order.wardId}`}</span>
          </div>
          <div className="flex items-center gap-2 col-span-full">
            <Phone size={14} className="text-gray-400" />
            <span className="text-gray-500">Customer Phone:</span>
            {type !== 'cancelled' ? (
              <a href={`tel:${order.shippingAddress?.phone}`} className="text-[#ff0000] hover:underline">
                {order.shippingAddress?.phone}
              </a>
            ) : (
              <span>{order.shippingAddress?.phone}</span>
            )}
          </div>
          <div className="flex items-center gap-2 col-span-full">
            <MapPin size={14} className="text-gray-400" />
            <span className="text-gray-500">Address:</span>
            <span className="text-gray-700">
              {order.shippingAddress?.street}, {order.shippingAddress?.city}
            </span>
          </div>
        </div>

        <div className="mb-3">
          <p className="text-sm font-medium text-gray-700 mb-1">
            Items ({order.products?.length || 0})
          </p>
          <div className="space-y-0.5">
            {(order.products || []).slice(0, 2).map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.quantity}x {item.name}
                  {item.variantName && ` (${item.variantName})`}
                </span>
                <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
            {order.products?.length > 2 && (
              <p className="text-xs text-gray-400">+{order.products.length - 2} more items</p>
            )}
          </div>
        </div>

        {type === 'cancelled' && order.cancellationReason && (
          <div className="mb-3 p-2 bg-red-50 rounded-lg">
            <p className="text-xs text-red-600 font-medium">Reason: {order.cancellationReason}</p>
          </div>
        )}

        <div className="flex flex-wrap justify-between items-center gap-3 pt-2 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500">Total Amount</p>
            <p className="text-lg font-bold text-gray-800">{formatCurrency(order.finalAmount)}</p>
            <p className="text-xs text-gray-500">
              Payment: {order.paymentMethod?.toUpperCase()} | {order.paymentStatus}
            </p>
          </div>
          
          <div className="flex gap-2">
            {type === 'active' && order.deliveryStatus === 'assigned' && (
              <button
                onClick={() => onPickup(order._id)}
                disabled={isUpdating === order._id}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
              >
                {isUpdating === order._id ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Package size={14} />
                )}
                Picked Up
              </button>
            )}
            
            {type === 'active' && order.deliveryStatus === 'picked_up' && (
              <button
                onClick={() => onDeliver(order._id)}
                disabled={isUpdating === order._id}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
              >
                {isUpdating === order._id ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <CheckCircle size={14} />
                )}
                Delivered
              </button>
            )}
            
            <button
              onClick={() => onView(order)}
              className="border border-gray-300 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm flex items-center gap-1 transition"
            >
              <Eye size={14} />
              View
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff0000] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <FaTruck className="text-[#ff0000]" size={24} />
            <h1 className="text-xl font-bold text-gray-800">Delivery Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:inline">
              Welcome, <span className="font-semibold">{deliveryBoy?.name}</span>
            </span>
            <button
              onClick={logout}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center gap-2"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6">
        {/* Refresh Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition duration-200 text-sm disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Stats Cards - 4 Cards including Cancelled */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Today's Deliveries */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Today's Deliveries</p>
                <p className="text-2xl font-bold text-gray-800">{stats.todayDeliveries}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FaCheckCircle className="text-green-600" size={20} />
              </div>
            </div>
          </div>

          {/* Pending Orders */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Pending Orders</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <FaClock className="text-yellow-600" size={20} />
              </div>
            </div>
          </div>

          {/* Total Deliveries */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Total Deliveries</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalDeliveries}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FaClipboardList className="text-blue-600" size={20} />
              </div>
            </div>
          </div>

          {/* Cancelled Orders - ADDED */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Cancelled Orders</p>
                <p className="text-2xl font-bold text-red-600">{cancelledOrders.length}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <FaTimesCircle className="text-red-600" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Boy Profile Card - Full Info */}
        <div className="bg-gradient-to-r from-[#ff0000] to-[#cc0000] rounded-lg p-5 text-white mb-6 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {/* Left Side - Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-white/20 p-3 rounded-full">
                  <FaUser size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-white/80 text-sm">Delivery Partner</p>
                  <h2 className="text-2xl font-bold">{deliveryBoy?.name}</h2>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div className="flex items-center gap-2">
                  <FaPhone size={14} className="text-white/80" />
                  <span className="text-white/90 text-sm">Phone:</span>
                  <span className="text-white font-medium">{deliveryBoy?.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaEnvelope size={14} className="text-white/80" />
                  <span className="text-white/90 text-sm">Email:</span>
                  <span className="text-white font-medium truncate">{deliveryBoy?.email}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <FaCar size={14} className="text-white/80" />
                  <span className="text-white/90 text-sm">Vehicle:</span>
                  <span className="text-white font-medium capitalize">{deliveryBoy?.vehicleType || 'Bike'}</span>
                </div>
              </div>
              
              {/* Wards Assigned */}
              <div className="mt-3 pt-2 border-t border-white/20">
                <div className="flex flex-wrap items-center gap-2">
                  <FaHashtag size={14} className="text-white/80" />
                  <span className="text-white/90 text-sm">Assigned Wards:</span>
                  {deliveryBoy?.wardIds?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {deliveryBoy.wardIds.map((wardId, index) => (
                        <span key={index} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                          <Hash size={10} />
                          Ward {wardId}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-white/60 text-sm">No wards assigned</span>
                  )}
                </div>
                {deliveryBoy?.wardNames?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {deliveryBoy.wardNames.map((wardName, index) => (
                      <span key={index} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                        <FaMapMarkerAlt size={10} />
                        {wardName.length > 30 ? wardName.substring(0, 30) + '...' : wardName}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Right Side - Status Badge */}
            
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
              activeTab === 'active' 
                ? 'bg-[#ff0000] text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Package size={16} />
            Active Orders ({activeOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('delivered')}
            className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
              activeTab === 'delivered' 
                ? 'bg-[#ff0000] text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <CheckSquare size={16} />
            Delivered Orders ({deliveredOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('cancelled')}
            className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
              activeTab === 'cancelled' 
                ? 'bg-[#ff0000] text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <XCircle size={16} />
            Cancelled Orders ({cancelledOrders.length})
          </button>
        </div>

        {/* Active Orders Section */}
        {activeTab === 'active' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <ShoppingBag size={18} />
                Active Orders ({activeOrders.length})
              </h2>
            </div>

            {activeOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto text-gray-400 mb-3" size={48} />
                <h3 className="text-lg font-medium text-gray-700">No active orders</h3>
                <p className="text-gray-500 text-sm mt-1">
                  Orders will appear here when assigned to you.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {activeOrders.map((order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    type="active"
                    onPickup={handlePickup}
                    onDeliver={handleDeliver}
                    onView={viewOrderDetails}
                    isUpdating={updatingOrderId}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Delivered Orders Section */}
        {activeTab === 'delivered' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 bg-green-50">
              <h2 className="text-lg font-semibold text-green-700 flex items-center gap-2">
                <CheckSquare size={18} />
                Delivered Orders ({deliveredOrders.length})
              </h2>
            </div>

            {deliveredOrders.length === 0 ? (
              <div className="text-center py-12">
                <CheckSquare className="mx-auto text-gray-400 mb-3" size={48} />
                <h3 className="text-lg font-medium text-gray-700">No delivered orders</h3>
                <p className="text-gray-500 text-sm mt-1">
                  Delivered orders will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {deliveredOrders.map((order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    type="delivered"
                    onPickup={handlePickup}
                    onDeliver={handleDeliver}
                    onView={viewOrderDetails}
                    isUpdating={updatingOrderId}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Cancelled Orders Section */}
        {activeTab === 'cancelled' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 bg-red-50">
              <h2 className="text-lg font-semibold text-red-700 flex items-center gap-2">
                <XCircle size={18} />
                Cancelled Orders ({cancelledOrders.length})
              </h2>
            </div>

            {cancelledOrders.length === 0 ? (
              <div className="text-center py-12">
                <XCircle className="mx-auto text-gray-400 mb-3" size={48} />
                <h3 className="text-lg font-medium text-gray-700">No cancelled orders</h3>
                <p className="text-gray-500 text-sm mt-1">
                  Cancelled orders will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {cancelledOrders.map((order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    type="cancelled"
                    onPickup={handlePickup}
                    onDeliver={handleDeliver}
                    onView={viewOrderDetails}
                    isUpdating={updatingOrderId}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Order Details Modal */}
      {showOrderModal && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setShowOrderModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard; 