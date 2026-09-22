// src/components/EditDeliveryBoyModal.jsx
import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, MapPin, Car, Truck, Lock } from 'lucide-react';

const EditDeliveryBoyModal = ({ isOpen, onClose, onEditDeliveryBoy, deliveryBoy, wards = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    wardId: '',
    vehicleType: 'bike',
    vehicleNumber: '',
    status: 'active'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPasswordField, setShowPasswordField] = useState(false);

  // Reset form when modal opens with delivery boy data
  useEffect(() => {
    if (deliveryBoy && isOpen) {
      setFormData({
        name: deliveryBoy.name || '',
        email: deliveryBoy.email || '',
        phone: deliveryBoy.phone || '',
        password: '', // Don't populate password
        wardId: deliveryBoy.wardId || '',
        vehicleType: deliveryBoy.vehicleType || 'bike',
        vehicleNumber: deliveryBoy.vehicleNumber || '',
        status: deliveryBoy.status || 'active'
      });
      setShowPasswordField(false);
      setError('');
    }
  }, [deliveryBoy, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Validation
    if (!formData.name.trim()) {
      setError('Name is required');
      setLoading(false);
      return;
    }
    
    if (!formData.email.trim()) {
      setError('Email is required');
      setLoading(false);
      return;
    }
    
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      setLoading(false);
      return;
    }
    
    if (!formData.wardId) {
      setError('Please select a ward');
      setLoading(false);
      return;
    }
    
    // Password validation only if user wants to change it
    if (formData.password && formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }
    
    try {
      // Find selected ward name
      const selectedWard = wards.find(w => w.wardId === parseInt(formData.wardId));
      const wardName = selectedWard ? selectedWard.wardName : `Ward ${formData.wardId}`;
      
      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        wardId: parseInt(formData.wardId),
        wardName: wardName,
        vehicleType: formData.vehicleType,
        vehicleNumber: formData.vehicleNumber.trim(),
        status: formData.status
      };
      
      // Only include password if user entered one
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      await onEditDeliveryBoy(deliveryBoy._id, updateData);
      onClose();
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.message || 'Failed to update delivery boy');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-3 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Truck size={20} className="text-[#ff0000]" />
            Edit Delivery Boy
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-[#ff0000] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff0000] focus:border-transparent text-sm"
                placeholder="Enter full name"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff0000] focus:border-transparent text-sm"
                placeholder="Enter email address"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff0000] focus:border-transparent text-sm"
                placeholder="Enter phone number"
              />
            </div>
          </div>

          {/* Password - Optional Change */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPasswordField(!showPasswordField)}
                className="text-xs text-[#ff0000] hover:text-[#cc0000]"
              >
                {showPasswordField ? 'Cancel' : 'Change Password'}
              </button>
            </div>
            {showPasswordField && (
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff0000] focus:border-transparent text-sm"
                  placeholder="Min 6 characters (leave blank to keep same)"
                />
              </div>
            )}
            {!showPasswordField && (
              <p className="text-xs text-gray-400 mt-1">•••••••• (click "Change Password" to update)</p>
            )}
          </div>

          {/* Select Ward */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign Ward <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                name="wardId"
                value={formData.wardId}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff0000] focus:border-transparent text-sm appearance-none bg-white"
              >
                <option value="">Select a ward</option>
                {wards.map((ward) => (
                  <option key={ward.wardId} value={ward.wardId}>
                    Ward {ward.wardId} - {ward.wardName}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Delivery boy will get orders from this ward automatically
            </p>
          </div>

          {/* Vehicle Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle Type
            </label>
            <div className="relative">
              <Car size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff0000] focus:border-transparent text-sm appearance-none bg-white"
              >
                <option value="bike">Bike</option>
                <option value="scooter">Scooter</option>
                <option value="car">Car</option>
              </select>
            </div>
          </div>

          {/* Vehicle Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle Number (Optional)
            </label>
            <div className="relative">
              <Truck size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff0000] focus:border-transparent text-sm"
                placeholder="e.g., TN-01-AB-1234"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <div className={`w-2 h-2 rounded-full ${formData.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff0000] focus:border-transparent text-sm appearance-none bg-white"
              >
                <option value="active">Active - Can receive orders</option>
                <option value="inactive">Inactive - Cannot receive orders</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#ff0000] rounded-lg hover:bg-[#cc0000] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? 'Updating...' : 'Update Delivery Boy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDeliveryBoyModal;