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
  Hash,
  DollarSign
} from 'lucide-react';
import { FaTruck, FaClipboardList, FaCheckCircle, FaClock, FaMapMarkerAlt, FaPhone, FaEnvelope, FaTimesCircle, FaHashtag, FaCalendarAlt, FaUser, FaCar, FaMoneyBillWave } from 'react-icons/fa';
import toast from 'react-hot-toast';

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

// ✅ Mark COD payment as received (no confirm)
const handleMarkCodPaid = async (orderId) => {
  try {
    setUpdatingOrderId(orderId);
    await deliveryBoyAPI.markCodPaid(orderId);
    toast.success('COD payment marked as received!');
    fetchDashboardData(true);
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to mark payment');
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

  const getPaymentBadge = (paymentStatus, paymentMethod) => {
    const method = (paymentMethod || '').toLowerCase();

    if (method === 'cod') {
      if (paymentStatus === 'completed') {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-green-100 text-green-800 border border-green-300">
            💵 COD · PAID
          </span>
        );
      }
      if (paymentStatus === 'refunded') {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-purple-100 text-purple-800 border border-purple-300">
            💵 COD · REFUNDED
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-yellow-100 text-yellow-800 border border-yellow-300">
          💵 COD · NOT PAID
        </span>
      );
    }

    if (method === 'razorpay') {
      if (paymentStatus === 'completed') {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-green-100 text-green-800 border border-green-300">
            💳 RAZORPAY · PAID
          </span>
        );
      }
      if (paymentStatus === 'refunded') {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-purple-100 text-purple-800 border border-purple-300">
            💳 RAZORPAY · REFUNDED
          </span>
        );
      }
      if (paymentStatus === 'failed') {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-red-100 text-red-800 border border-red-300">
            💳 RAZORPAY · FAILED
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-yellow-100 text-yellow-800 border border-yellow-300">
          💳 RAZORPAY · PENDING
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-gray-100 text-gray-700 border border-gray-300">
        {(paymentMethod || 'UNKNOWN').toUpperCase()} · {(paymentStatus || 'UNKNOWN').toUpperCase()}
      </span>
    );
  };

  const getLocationDisplay = (order) => {
    if (order.wardId) {
      return {
        type: 'ward',
        label: `Ward ${order.wardId}`,
        name: order.wardName || `Ward ${order.wardId}`,
        typedArea: order.typedArea || null,
      };
    }
    return {
      type: 'city',
      label: order.shippingAddress?.city || '',
      name: order.shippingAddress?.street || '',
      typedArea: order.typedArea || null,
    };
  };

  const getFullAddress = (order) => {
    if (!order.shippingAddress) return '—';
    
    const parts = [];
    const typed = (order.typedArea || '').trim();
    const street = (order.shippingAddress.street || '').trim();
    
    if (typed && !street.toLowerCase().includes(typed.toLowerCase())) {
      parts.push(typed);
    }
    if (street) parts.push(street);
    if (order.shippingAddress.city) parts.push(order.shippingAddress.city);
    if (order.shippingAddress.state) parts.push(order.shippingAddress.state);
    if (order.shippingAddress.postalCode) parts.push(order.shippingAddress.postalCode);
    
    return parts.length > 0 ? parts.join(', ') : '—';
  };

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;

    const loc = getLocationDisplay(order);

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
                <p className="text-xs text-gray-500 mb-1">Order Status</p>
                {getStatusBadge(order.deliveryStatus, order.orderStatus)}
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Payment</p>
                {getPaymentBadge(order.paymentStatus, order.paymentMethod)}
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-3 space-y-1.5 text-sm">
              {loc.typedArea && (
                <div className="flex items-start gap-2">
                  <span className="text-gray-500 flex-shrink-0 w-20">Area:</span>
                  <span className="font-bold text-orange-700 break-words">{loc.typedArea}</span>
                </div>
              )}
              {loc.type === 'ward' && (
                <div className="flex items-start gap-2">
                  <span className="text-gray-500 flex-shrink-0 w-20">Ward:</span>
                  <span className="font-bold text-blue-700 break-words">{loc.label} — {loc.name}</span>
                </div>
              )}
              <div className="flex items-start gap-2">
                <span className="text-gray-500 flex-shrink-0 w-20">Street:</span>
                <span className="text-gray-700 break-words">{order.shippingAddress?.street || '—'}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-gray-500 flex-shrink-0 w-20">City:</span>
                <span className="text-gray-700 break-words">{order.shippingAddress?.city || '—'}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-gray-500 flex-shrink-0 w-20">State:</span>
                <span className="text-gray-700 break-words">{order.shippingAddress?.state || '—'}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-gray-500 flex-shrink-0 w-20">Postal Code:</span>
                <span className="text-gray-700 break-words">{order.shippingAddress?.postalCode || '—'}</span>
              </div>
              <div className="flex items-start gap-2 pt-2 border-t border-blue-200">
                <span className="text-gray-500 flex-shrink-0 w-20">Address:</span>
                <span className="text-gray-800 font-medium break-words">{getFullAddress(order)}</span>
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

            <div className="bg-gray-100 rounded-lg p-3 flex justify-between items-center">
              <div>
                <span className="font-semibold block">Total Amount</span>
                <div className="mt-1">
                  {getPaymentBadge(order.paymentStatus, order.paymentMethod)}
                </div>
              </div>
              <span className="text-xl font-bold text-[#ff0000]">{formatCurrency(order.finalAmount)}</span>
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

  const OrderCard = ({ order, type, onPickup, onDeliver, onMarkCodPaid, onView, isUpdating }) => {
    const loc = getLocationDisplay(order);

    // ✅ Strict flow conditions
    const isCod = order.paymentMethod === 'cod';
    const isPaid = order.paymentStatus === 'completed';
    const isPickedUp = order.deliveryStatus === 'picked_up';
    const isAssigned = order.deliveryStatus === 'assigned';
    const isActive = type === 'active' && order.orderStatus !== 'cancelled';

    // 1. Pickup: shown when assigned (not yet picked up)
    const showPickupBtn = isActive && isAssigned;

    // 2. Mark COD Paid: shown only after pickup, only for COD, only if not yet paid
    const showCodPaidBtn =
      isActive &&
      isPickedUp &&
      isCod &&
      !isPaid &&
      order.paymentStatus !== 'refunded';

    // 3. Delivered: shown only after pickup,
    //    for Razorpay: always allowed
    //    for COD: only after payment is marked paid
    const showDeliverBtn =
      isActive &&
      isPickedUp &&
      (!isCod || isPaid);

    return (
      <div className="p-4 hover:bg-gray-50 transition-colors">
        <div className="flex flex-wrap justify-between items-start mb-3 gap-2">
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
          <div className="flex flex-col items-end gap-1.5">
            {getStatusBadge(order.deliveryStatus, order.orderStatus)}
            {getPaymentBadge(order.paymentStatus, order.paymentMethod)}
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg space-y-1.5 text-sm mb-3">
          {loc.typedArea && (
            <div className="flex items-start gap-2">
              <span className="text-gray-500 flex-shrink-0 w-20">Area:</span>
              <span className="font-bold text-orange-700 break-words">{loc.typedArea}</span>
            </div>
          )}
          {loc.type === 'ward' && (
            <div className="flex items-start gap-2">
              <span className="text-gray-500 flex-shrink-0 w-20">Ward:</span>
              <span className="font-bold text-blue-700 break-words">{loc.label} — {loc.name}</span>
            </div>
          )}
          <div className="flex items-start gap-2">
            <span className="text-gray-500 flex-shrink-0 w-20">Street:</span>
            <span className="text-gray-700 break-words">{order.shippingAddress?.street || '—'}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-gray-500 flex-shrink-0 w-20">City:</span>
            <span className="text-gray-700 break-words">{order.shippingAddress?.city || '—'}</span>
          </div>
          <div className="flex items-start gap-2 pt-2 border-t border-blue-200">
            <span className="text-gray-500 flex-shrink-0 w-20">Address:</span>
            <span className="text-gray-800 font-medium break-words">{getFullAddress(order)}</span>
          </div>
          <div className="flex items-start gap-2 pt-2 border-t border-blue-200">
            <span className="text-gray-500 flex-shrink-0 w-20">Phone:</span>
            {type !== 'cancelled' ? (
              <a href={`tel:${order.shippingAddress?.phone}`} className="text-[#ff0000] hover:underline break-all">
                {order.shippingAddress?.phone}
              </a>
            ) : (
              <span className="break-all">{order.shippingAddress?.phone}</span>
            )}
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
            <div className="mt-1">
              {getPaymentBadge(order.paymentStatus, order.paymentMethod)}
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {/* 1. Picked Up */}
            {showPickupBtn && (
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

            {/* 2. Mark COD Paid (only after pickup, only for COD, only if not paid) */}
            {showCodPaidBtn && (
              <button
                onClick={() => onMarkCodPaid(order._id)}
                disabled={isUpdating === order._id}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                title="Confirm cash collected"
              >
                {isUpdating === order._id ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <FaMoneyBillWave size={14} />
                )}
                Mark COD Paid
              </button>
            )}

            {/* 3. Delivered (only after pickup, and for COD only after payment done) */}
            {showDeliverBtn && (
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

        <div className="bg-gradient-to-r from-[#ff0000] to-[#cc0000] rounded-lg p-5 text-white mb-6 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
              
              {deliveryBoy?.areas?.length > 0 && (
                <div className="mt-3 pt-2 border-t border-white/20">
                  <div className="flex flex-wrap items-center gap-2">
                    <FaMapMarkerAlt size={14} className="text-white/80" />
                    <span className="text-white/90 text-sm">Assigned Cities:</span>
                    <div className="flex flex-wrap gap-2">
                      {deliveryBoy.areas.map((area, index) => (
                        <span key={index} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                          <FaMapMarkerAlt size={10} />
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {deliveryBoy?.wardIds?.length > 0 && (
                <div className="mt-3 pt-2 border-t border-white/20">
                  <div className="flex flex-wrap items-center gap-2">
                    <FaHashtag size={14} className="text-white/80" />
                    <span className="text-white/90 text-sm">Assigned Wards:</span>
                    <div className="flex flex-wrap gap-2">
                      {deliveryBoy.wardIds.map((wardId, index) => (
                        <span key={index} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                          <Hash size={10} />
                          Ward {wardId}
                        </span>
                      ))}
                    </div>
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
              )}

              {!deliveryBoy?.areas?.length && !deliveryBoy?.wardIds?.length && (
                <div className="mt-3 pt-2 border-t border-white/20 text-white/60 text-sm">
                  
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mb-4 flex-wrap">
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
                    onMarkCodPaid={handleMarkCodPaid}
                    onView={viewOrderDetails}
                    isUpdating={updatingOrderId}
                  />
                ))}
              </div>
            )}
          </div>
        )}

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
                    onMarkCodPaid={handleMarkCodPaid}
                    onView={viewOrderDetails}
                    isUpdating={updatingOrderId}
                  />
                ))}
              </div>
            )}
          </div>
        )}

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
                    onMarkCodPaid={handleMarkCodPaid}
                    onView={viewOrderDetails}
                    isUpdating={updatingOrderId}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

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