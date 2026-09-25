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

  const formatWeight = (item) => {
    if (!item?.weight || item.weight <= 0) return null;
    const unit = item.weightUnit === 'gram' ? 'g' : item.weightUnit === 'kg' ? 'kg' : (item.weightUnit || 'g');
    return `${item.weight}${unit}`;
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

  // ✅ Build a Google Maps directions URL
  // 🎯 Priority 1: stored lat/lng (exact, from Geocoding API)
  // 🎯 Priority 2: text fallback (pincode-first, deduped)
  const getGoogleMapsUrl = (order) => {
    if (!order?.shippingAddress) return '#';

    const a = order.shippingAddress;

    // 🎯 Priority 1 — use stored coordinates if available (100% reliable)
    if (a.latitude && a.longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${a.latitude},${a.longitude}`;
    }

    // 🎯 Priority 2 — text fallback for old orders without coordinates
    const typed = (order.typedArea || '').trim();
    const street = (a.street || '').trim();
    const city = (a.city || '').trim();
    const state = (a.state || '').trim();
    const postal = (a.postalCode || '').trim();
    const country = (a.country || 'India').trim();

    const parts = [];

    if (street) parts.push(street);

    if (typed && !street.toLowerCase().includes(typed.toLowerCase())) {
      parts.push(typed);
    }

    if (postal) parts.push(postal);
    if (city) parts.push(city);
    if (state) parts.push(state);
    if (country) parts.push(country);

    const seen = new Set();
    const cleaned = [];
    for (const p of parts) {
      const key = p.toLowerCase().replace(/\s+/g, ' ').trim();
      if (key && !seen.has(key)) {
        seen.add(key);
        cleaned.push(p.replace(/\s+/g, ' ').trim());
      }
    }

    if (cleaned.length === 0) return '#';

    const query = cleaned.join(', ');
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
  };

  const getCustomerName = (order) =>
    order.name ||
    order.shippingAddress?.name ||
    order.customer?.name ||
    order.user?.name ||
    'Customer';

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
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-2 sm:p-4 z-50">
        <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col shadow-2xl">
          <div className={`p-3 sm:p-4 flex justify-between items-center rounded-t-lg ${order.orderStatus === 'cancelled' ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-[#ff0000] to-[#cc0000]'} text-white`}>
            <div className="flex items-center gap-2">
              {order.orderStatus === 'cancelled' ? <XCircle size={18} className="sm:w-5 sm:h-5" /> : <Package size={18} className="sm:w-5 sm:h-5" />}
              <h2 className="font-bold text-base sm:text-lg">Order Details</h2>
            </div>
            <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1 transition">
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3 sm:space-y-4">
            <div className="grid grid-cols-2 gap-2 sm:gap-3 pb-3 border-b">
              <div>
                <p className="text-[11px] sm:text-xs text-gray-500">Order ID</p>
                <p className="font-medium text-xs sm:text-sm break-all">{order.orderId || order._id?.slice(-8)}</p>
              </div>
              <div>
                <p className="text-[11px] sm:text-xs text-gray-500">
                  {order.orderStatus === 'cancelled' ? 'Cancelled On' : 'Placed On'}
                </p>
                <p className="font-medium text-xs sm:text-sm">
                  {formatDate(order.orderStatus === 'cancelled' ? (order.cancelledAt || order.updatedAt) : order.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-[11px] sm:text-xs text-gray-500 mb-1">Order Status</p>
                {getStatusBadge(order.deliveryStatus, order.orderStatus)}
              </div>
              <div>
                <p className="text-[11px] sm:text-xs text-gray-500 mb-1">Payment</p>
                {getPaymentBadge(order.paymentStatus, order.paymentMethod)}
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-2.5 sm:p-3 space-y-1.5 text-xs sm:text-sm">
              <div className="flex items-start gap-2">
                <span className="text-gray-500 flex-shrink-0 w-16 sm:w-20">Name:</span>
                <span className="font-bold text-gray-900 break-words">
                  👤 {getCustomerName(order)}
                </span>
              </div>

              {loc.typedArea && (
                <div className="flex items-start gap-2">
                  <span className="text-gray-500 flex-shrink-0 w-16 sm:w-20">Area:</span>
                  <span className="font-bold text-orange-700 break-words">{loc.typedArea}</span>
                </div>
              )}
              {loc.type === 'ward' && (
                <div className="flex items-start gap-2">
                  <span className="text-gray-500 flex-shrink-0 w-16 sm:w-20">Ward:</span>
                  <span className="font-bold text-blue-700 break-words">{loc.label} — {loc.name}</span>
                </div>
              )}
              <div className="flex items-start gap-2">
                <span className="text-gray-500 flex-shrink-0 w-16 sm:w-20">Street:</span>
                <span className="text-gray-700 break-words">{order.shippingAddress?.street || '—'}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-gray-500 flex-shrink-0 w-16 sm:w-20">City:</span>
                <span className="text-gray-700 break-words">{order.shippingAddress?.city || '—'}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-gray-500 flex-shrink-0 w-16 sm:w-20">State:</span>
                <span className="text-gray-700 break-words">{order.shippingAddress?.state || '—'}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-gray-500 flex-shrink-0 w-16 sm:w-20">Postal Code:</span>
                <span className="text-gray-700 break-words">{order.shippingAddress?.postalCode || '—'}</span>
              </div>
              <div className="flex items-start gap-2 pt-2 border-t border-blue-200">
                <span className="text-gray-500 flex-shrink-0 w-16 sm:w-20">Address:</span>
                <span className="text-gray-800 font-medium break-words">{getFullAddress(order)}</span>
              </div>

              {order.shippingAddress && (
                <div className="pt-2 mt-1 border-t border-blue-200">
                  <a
                    href={getGoogleMapsUrl(order)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium transition-colors"
                  >
                    <FaMapMarkerAlt size={13} />
                    Open in Google Maps
                  </a>
                </div>
              )}
            </div>

            {order.deliveryDeliveredAt && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 sm:p-3">
                <p className="text-[11px] sm:text-xs text-green-600 font-medium">Delivery Completed</p>
                <p className="text-xs sm:text-sm text-green-700">Delivered on: {formatDate(order.deliveryDeliveredAt)}</p>
              </div>
            )}

            {order.orderStatus === 'cancelled' && order.cancellationReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 sm:p-3">
                <p className="text-[11px] sm:text-xs text-red-600 font-medium">Cancellation Reason</p>
                <p className="text-xs sm:text-sm text-red-700">{order.cancellationReason}</p>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-2.5 sm:p-3">
              <h3 className="font-medium text-sm sm:text-base text-gray-800 mb-2">Customer Details</h3>
              <div className="space-y-1 text-xs sm:text-sm">
                <p>
                  <span className="text-gray-500">Name:</span>{' '}
                  <span className="font-medium">{getCustomerName(order)}</span>
                </p>
                <p><span className="text-gray-500">Phone:</span> {order.shippingAddress?.phone}</p>
                {order.shippingAddress?.email && (
                  <p><span className="text-gray-500">Email:</span> {order.shippingAddress.email}</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-sm sm:text-base text-gray-800 mb-2">Items ({order.products?.length || 0})</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(order.products || []).map((item, idx) => {
                  const weight = formatWeight(item);
                  return (
                    <div key={idx} className="flex justify-between items-center border-b pb-2">
                      <div className="min-w-0 pr-2">
                        <p className="font-medium text-xs sm:text-sm break-words">{item.name}</p>
                        {weight && (
                          <p className="text-[11px] sm:text-xs text-gray-500">
                            Weight: {weight}
                          </p>
                        )}
                        <p className="text-[11px] sm:text-xs text-gray-500">
                          {item.quantity} Quantity : {formatCurrency(item.price)}
                        </p>
                      </div>
                      <p className="font-semibold text-xs sm:text-sm whitespace-nowrap">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-100 rounded-lg p-2.5 sm:p-3 flex justify-between items-center">
              <div>
                <span className="font-semibold text-sm sm:text-base block">Total Amount</span>
                <div className="mt-1">
                  {getPaymentBadge(order.paymentStatus, order.paymentMethod)}
                </div>
              </div>
              <span className="text-lg sm:text-xl font-bold text-[#ff0000]">{formatCurrency(order.finalAmount)}</span>
            </div>
          </div>

          <div className="p-3 sm:p-4 border-t bg-gray-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm"
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

    const isCod = order.paymentMethod === 'cod';
    const isPaid = order.paymentStatus === 'completed';
    const isPickedUp = order.deliveryStatus === 'picked_up';
    const isAssigned = order.deliveryStatus === 'assigned';
    const isActive = type === 'active' && order.orderStatus !== 'cancelled';

    const showPickupBtn = isActive && isAssigned;
    const showCodPaidBtn =
      isActive &&
      isPickedUp &&
      isCod &&
      !isPaid &&
      order.paymentStatus !== 'refunded';
    const showDeliverBtn =
      isActive &&
      isPickedUp &&
      (!isCod || isPaid);

    return (
      <div className="p-3 sm:p-4 hover:bg-gray-50 transition-colors">
        <div className="flex flex-wrap justify-between items-start mb-3 gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-gray-900 break-all">
              Order #{order.orderId || order._id?.slice(-8)}
            </p>
            <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
              {type === 'delivered'
                ? `Delivered: ${formatDate(order.deliveryDeliveredAt || order.deliveredAt)}`
                : type === 'cancelled'
                ? `Cancelled: ${formatDate(order.cancelledAt || order.updatedAt)}`
                : `Placed: ${formatDate(order.createdAt)}`
              }
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            {getStatusBadge(order.deliveryStatus, order.orderStatus)}
            {getPaymentBadge(order.paymentStatus, order.paymentMethod)}
          </div>
        </div>

        <div className="bg-blue-50 p-2.5 sm:p-3 rounded-lg space-y-1.5 text-xs sm:text-sm mb-3">
          <div className="flex items-start gap-2">
            <span className="text-gray-500 flex-shrink-0 w-16 sm:w-20">Name:</span>
            <span className="font-bold text-gray-900 break-words">
              👤 {getCustomerName(order)}
            </span>
          </div>

          <div className="flex items-start gap-2 pt-2 border-t border-blue-200">
            <span className="text-gray-500 flex-shrink-0 w-16 sm:w-20">Phone:</span>
            {type !== 'cancelled' ? (
              <a href={`tel:${order.shippingAddress?.phone}`} className="text-[#ff0000] hover:underline break-all">
                {order.shippingAddress?.phone}
              </a>
            ) : (
              <span className="break-all">{order.shippingAddress?.phone}</span>
            )}
          </div>

          {order.shippingAddress && (
            <div className="flex items-start gap-2 pt-2 border-t border-blue-200">
              <span className="text-gray-500 flex-shrink-0 w-16 sm:w-20">Map:</span>
              <a
                href={getGoogleMapsUrl(order)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-[11px] sm:text-xs font-medium transition-colors"
              >
                <FaMapMarkerAlt size={11} />
                Open in Google Maps
              </a>
            </div>
          )}

          {loc.typedArea && (
            <div className="flex items-start gap-2">
              <span className="text-gray-500 flex-shrink-0 w-16 sm:w-20">Area:</span>
              <span className="font-bold text-orange-700 break-words">{loc.typedArea}</span>
            </div>
          )}
          {loc.type === 'ward' && (
            <div className="flex items-start gap-2">
              <span className="text-gray-500 flex-shrink-0 w-16 sm:w-20">Ward:</span>
              <span className="font-bold text-blue-700 break-words">{loc.label} — {loc.name}</span>
            </div>
          )}
          <div className="flex items-start gap-2">
            <span className="text-gray-500 flex-shrink-0 w-16 sm:w-20">Street:</span>
            <span className="text-gray-700 break-words">{order.shippingAddress?.street || '—'}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-gray-500 flex-shrink-0 w-16 sm:w-20">City:</span>
            <span className="text-gray-700 break-words">{order.shippingAddress?.city || '—'}</span>
          </div>
          <div className="flex items-start gap-2 pt-2 border-t border-blue-200">
            <span className="text-gray-500 flex-shrink-0 w-16 sm:w-20">Address:</span>
            <span className="text-gray-800 font-medium break-words">{getFullAddress(order)}</span>
          </div>
        </div>

        <div className="mb-3">
          <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Items ({order.products?.length || 0})
          </p>
          <div className="space-y-0.5">
            {(order.products || []).slice(0, 2).map((item, idx) => {
              const weight = formatWeight(item);
              return (
                <div key={idx} className="flex justify-between text-xs sm:text-sm gap-2">
                  <span className="text-gray-600 min-w-0 break-words">
                    {item.quantity} Quantity : {item.name}
                    {weight && ` (${weight})`}
                  </span>
                  <span className="font-medium whitespace-nowrap">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              );
            })}
            {order.products?.length > 2 && (
              <p className="text-[11px] sm:text-xs text-gray-400">+{order.products.length - 2} more items</p>
            )}
          </div>
        </div>

        {type === 'cancelled' && order.cancellationReason && (
          <div className="mb-3 p-2 bg-red-50 rounded-lg">
            <p className="text-[11px] sm:text-xs text-red-600 font-medium">Reason: {order.cancellationReason}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-between sm:items-center gap-3 pt-2 border-t border-gray-100">
          <div className="flex items-center sm:block justify-between">
            <div>
              <p className="text-[11px] sm:text-xs text-gray-500">Total Amount</p>
              <p className="text-base sm:text-lg font-bold text-gray-800">{formatCurrency(order.finalAmount)}</p>
            </div>
            <div className="mt-0 sm:mt-1">
              {getPaymentBadge(order.paymentStatus, order.paymentMethod)}
            </div>
          </div>

          <div className="flex gap-2 flex-wrap w-full sm:w-auto">
            {showPickupBtn && (
              <button
                onClick={() => onPickup(order._id)}
                disabled={isUpdating === order._id}
                className="flex-1 sm:flex-none bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-50"
              >
                {isUpdating === order._id ? (
                  <div className="animate-spin h-3.5 w-3.5 sm:h-4 sm:w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Package size={13} className="sm:w-3.5 sm:h-3.5" />
                )}
                Picked Up
              </button>
            )}

            {showCodPaidBtn && (
              <button
                onClick={() => onMarkCodPaid(order._id)}
                disabled={isUpdating === order._id}
                className="flex-1 sm:flex-none bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-50"
                title="Confirm cash collected"
              >
                {isUpdating === order._id ? (
                  <div className="animate-spin h-3.5 w-3.5 sm:h-4 sm:w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <FaMoneyBillWave size={13} className="sm:w-3.5 sm:h-3.5" />
                )}
                Mark COD Paid
              </button>
            )}

            {showDeliverBtn && (
              <button
                onClick={() => onDeliver(order._id)}
                disabled={isUpdating === order._id}
                className="flex-1 sm:flex-none bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-50"
              >
                {isUpdating === order._id ? (
                  <div className="animate-spin h-3.5 w-3.5 sm:h-4 sm:w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <CheckCircle size={13} className="sm:w-3.5 sm:h-3.5" />
                )}
                Delivered
              </button>
            )}

            <button
              onClick={() => onView(order)}
              className="flex-1 sm:flex-none border border-gray-300 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-1 transition"
            >
              <Eye size={13} className="sm:w-3.5 sm:h-3.5" />
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
        <div className="flex items-center justify-between px-3 sm:px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <FaTruck className="text-[#ff0000] flex-shrink-0" size={22} />
            <h1 className="text-base sm:text-xl font-bold text-gray-800 truncate">Delivery Dashboard</h1>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-sm text-gray-600 hidden sm:inline">
              Welcome, <span className="font-semibold">{deliveryBoy?.name}</span>
            </span>
            <button
              onClick={logout}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 sm:px-4 py-2 rounded-lg transition duration-200 flex items-center gap-2 text-sm"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="p-3 sm:p-6">
        <div className="flex justify-end mb-3 sm:mb-4">
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 transition duration-200 text-xs sm:text-sm disabled:opacity-50"
          >
            <RefreshCw size={14} className={`sm:w-4 sm:h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <div className="grid grid-cols-4 gap-1.5 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1.5 sm:p-4">
            <div className="flex flex-col items-center text-center sm:flex-row sm:justify-between sm:items-center sm:text-left">
              <div className="min-w-0 w-full sm:w-auto">
                <p className="text-[9px] sm:text-sm text-gray-500 font-medium leading-tight truncate">
                  <span className="sm:hidden">Today</span>
                  <span className="hidden sm:inline">Today's Deliveries</span>
                </p>
                <p className="text-base sm:text-2xl font-bold text-gray-800 mt-0.5">
                  {stats.todayDeliveries}
                </p>
              </div>
              <div className="hidden sm:flex bg-green-100 p-2 rounded-full flex-shrink-0">
                <FaCheckCircle className="text-green-600" size={16} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1.5 sm:p-4">
            <div className="flex flex-col items-center text-center sm:flex-row sm:justify-between sm:items-center sm:text-left">
              <div className="min-w-0 w-full sm:w-auto">
                <p className="text-[9px] sm:text-sm text-gray-500 font-medium leading-tight truncate">
                  Pending
                </p>
                <p className="text-base sm:text-2xl font-bold text-yellow-600 mt-0.5">
                  {stats.pendingOrders}
                </p>
              </div>
              <div className="hidden sm:flex bg-yellow-100 p-2 rounded-full flex-shrink-0">
                <FaClock className="text-yellow-600" size={16} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1.5 sm:p-4">
            <div className="flex flex-col items-center text-center sm:flex-row sm:justify-between sm:items-center sm:text-left">
              <div className="min-w-0 w-full sm:w-auto">
                <p className="text-[9px] sm:text-sm text-gray-500 font-medium leading-tight truncate">
                  Total
                </p>
                <p className="text-base sm:text-2xl font-bold text-blue-600 mt-0.5">
                  {stats.totalDeliveries}
                </p>
              </div>
              <div className="hidden sm:flex bg-blue-100 p-2 rounded-full flex-shrink-0">
                <FaClipboardList className="text-blue-600" size={16} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1.5 sm:p-4">
            <div className="flex flex-col items-center text-center sm:flex-row sm:justify-between sm:items-center sm:text-left">
              <div className="min-w-0 w-full sm:w-auto">
                <p className="text-[9px] sm:text-sm text-gray-500 font-medium leading-tight truncate">
                  Cancelled
                </p>
                <p className="text-base sm:text-2xl font-bold text-red-600 mt-0.5">
                  {cancelledOrders.length}
                </p>
              </div>
              <div className="hidden sm:flex bg-red-100 p-2 rounded-full flex-shrink-0">
                <FaTimesCircle className="text-red-600" size={16} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#ff0000] to-[#cc0000] rounded-lg p-3 sm:p-5 text-white mb-4 sm:mb-6 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1 w-full">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="bg-white/20 p-2 sm:p-3 rounded-full flex-shrink-0">
                  <FaUser size={18} className="sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-white/80 text-[11px] sm:text-sm">Delivery Partner</p>
                  <h2 className="text-lg sm:text-2xl font-bold truncate">{deliveryBoy?.name}</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-2 sm:mt-3">
                <div className="flex items-center gap-2">
                  <FaPhone size={12} className="sm:w-3.5 sm:h-3.5 text-white/80 flex-shrink-0" />
                  <span className="text-white/90 text-xs sm:text-sm">Phone:</span>
                  <span className="text-white font-medium text-xs sm:text-sm truncate">{deliveryBoy?.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaEnvelope size={12} className="sm:w-3.5 sm:h-3.5 text-white/80 flex-shrink-0" />
                  <span className="text-white/90 text-xs sm:text-sm">Email:</span>
                  <span className="text-white font-medium text-xs sm:text-sm truncate">{deliveryBoy?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCar size={12} className="sm:w-3.5 sm:h-3.5 text-white/80 flex-shrink-0" />
                  <span className="text-white/90 text-xs sm:text-sm">Vehicle:</span>
                  <span className="text-white font-medium text-xs sm:text-sm capitalize">{deliveryBoy?.vehicleType || 'Bike'}</span>
                </div>
              </div>

              {deliveryBoy?.areas?.length > 0 && (
                <div className="mt-2 sm:mt-3 pt-2 border-t border-white/20">
                  <div className="flex flex-wrap items-center gap-2">
                    <FaMapMarkerAlt size={12} className="sm:w-3.5 sm:h-3.5 text-white/80" />
                    <span className="text-white/90 text-xs sm:text-sm">Assigned Cities:</span>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {deliveryBoy.areas.map((area, index) => (
                        <span key={index} className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-white/20 text-white">
                          <FaMapMarkerAlt size={9} className="sm:w-2.5 sm:h-2.5" />
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {deliveryBoy?.wardIds?.length > 0 && (
                <div className="mt-2 sm:mt-3 pt-2 border-t border-white/20">
                  <div className="flex flex-wrap items-center gap-2">
                    <FaHashtag size={12} className="sm:w-3.5 sm:h-3.5 text-white/80" />
                    <span className="text-white/90 text-xs sm:text-sm">Assigned Wards:</span>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {deliveryBoy.wardIds.map((wardId, index) => (
                        <span key={index} className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-white/20 text-white">
                          <Hash size={9} className="sm:w-2.5 sm:h-2.5" />
                          Ward {wardId}
                        </span>
                      ))}
                    </div>
                  </div>
                  {deliveryBoy?.wardNames?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
                      {deliveryBoy.wardNames.map((wardName, index) => (
                        <span key={index} className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-white/20 text-white">
                          <FaMapMarkerAlt size={9} className="sm:w-2.5 sm:h-2.5" />
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

        <div className="flex gap-1.5 sm:gap-3 mb-3 sm:mb-4 flex-wrap">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 sm:flex-none px-2 sm:px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-base ${
              activeTab === 'active'
                ? 'bg-[#ff0000] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Package size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Active Orders</span>
            <span className="sm:hidden">Active</span>
            ({activeOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('delivered')}
            className={`flex-1 sm:flex-none px-2 sm:px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-base ${
              activeTab === 'delivered'
                ? 'bg-[#ff0000] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <CheckSquare size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Delivered Orders</span>
            <span className="sm:hidden">Delivered</span>
            ({deliveredOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('cancelled')}
            className={`flex-1 sm:flex-none px-2 sm:px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-base ${
              activeTab === 'cancelled'
                ? 'bg-[#ff0000] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <XCircle size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Cancelled Orders</span>
            <span className="sm:hidden">Cancelled</span>
            ({cancelledOrders.length})
          </button>
        </div>

        {activeTab === 'active' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-200 bg-gray-50">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                <ShoppingBag size={16} className="sm:w-[18px] sm:h-[18px]" />
                Active Orders ({activeOrders.length})
              </h2>
            </div>

            {activeOrders.length === 0 ? (
              <div className="text-center py-10 sm:py-12">
                <Package className="mx-auto text-gray-400 mb-3" size={40} />
                <h3 className="text-base sm:text-lg font-medium text-gray-700">No active orders</h3>
                <p className="text-gray-500 text-xs sm:text-sm mt-1">
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
            <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-200 bg-green-50">
              <h2 className="text-base sm:text-lg font-semibold text-green-700 flex items-center gap-2">
                <CheckSquare size={16} className="sm:w-[18px] sm:h-[18px]" />
                Delivered Orders ({deliveredOrders.length})
              </h2>
            </div>

            {deliveredOrders.length === 0 ? (
              <div className="text-center py-10 sm:py-12">
                <CheckSquare className="mx-auto text-gray-400 mb-3" size={40} />
                <h3 className="text-base sm:text-lg font-medium text-gray-700">No delivered orders</h3>
                <p className="text-gray-500 text-xs sm:text-sm mt-1">
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
            <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-200 bg-red-50">
              <h2 className="text-base sm:text-lg font-semibold text-red-700 flex items-center gap-2">
                <XCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
                Cancelled Orders ({cancelledOrders.length})
              </h2>
            </div>

            {cancelledOrders.length === 0 ? (
              <div className="text-center py-10 sm:py-12">
                <XCircle className="mx-auto text-gray-400 mb-3" size={40} />
                <h3 className="text-base sm:text-lg font-medium text-gray-700">No cancelled orders</h3>
                <p className="text-gray-500 text-xs sm:text-sm mt-1">
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