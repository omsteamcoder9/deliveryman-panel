// src/pages/DeliveryBoys.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import AddDeliveryBoyModal from '../components/AddDeliveryBoyModal';
import EditDeliveryBoyModal from '../components/EditDeliveryBoyModal';
import { deliveryBoyAPI } from '../api/deliveryBoy';
import { FaEdit, FaTrash, FaPlus, FaSignOutAlt, FaSyncAlt, FaSearch, FaTruck, FaMapMarkerAlt, FaCheckCircle, FaTimesCircle, FaHashtag } from 'react-icons/fa';

const DeliveryBoys = () => {
  const { user, logout, isAdmin } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDeliveryBoy, setEditingDeliveryBoy] = useState(null);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [filteredDeliveryBoys, setFilteredDeliveryBoys] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch delivery boys from API
  const fetchDeliveryBoys = async (showRefreshingState = false) => {
    try {
      if (showRefreshingState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const response = await deliveryBoyAPI.getAllDeliveryBoys();
      
      let boysArray = [];
      const data = response.data;
      
      if (data.deliveryBoys && Array.isArray(data.deliveryBoys)) {
        boysArray = data.deliveryBoys;
      } else if (Array.isArray(data)) {
        boysArray = data;
      } else {
        throw new Error('Unexpected response format');
      }

      setDeliveryBoys(boysArray);
      setFilteredDeliveryBoys(boysArray);
      setError('');
    } catch (error) {
      console.error('Error fetching delivery boys:', error);
      setError(error.message || 'Failed to load delivery boys');
      setDeliveryBoys([]);
      setFilteredDeliveryBoys([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch wards
  const fetchWards = async () => {
    try {
      const response = await deliveryBoyAPI.getWardsList();
      setWards(response.data.wards || []);
    } catch (error) {
      console.error('Error fetching wards:', error);
    }
  };

  useEffect(() => {
    fetchDeliveryBoys();
    fetchWards();
  }, []);

  // Search and filter logic
  useEffect(() => {
    let results = [...deliveryBoys];

    // Search filter by name, phone, email
    if (searchTerm) {
      results = results.filter(boy =>
        boy.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        boy.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        boy.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      results = results.filter(boy => boy.status === statusFilter);
    }

    setFilteredDeliveryBoys(results);
  }, [searchTerm, statusFilter, deliveryBoys]);

  // Handle manual refresh
  const handleRefresh = () => {
    fetchDeliveryBoys(true);
  };

  const handleAddDeliveryBoy = async (deliveryBoyData) => {
    try {
      const response = await deliveryBoyAPI.addDeliveryBoy(deliveryBoyData);
      const newDeliveryBoy = response.data.deliveryBoy;
      const newDeliveryBoys = [...deliveryBoys, newDeliveryBoy];
      setDeliveryBoys(newDeliveryBoys);
      setFilteredDeliveryBoys(newDeliveryBoys);
      setIsModalOpen(false);
      setError('✅ Delivery boy added successfully!');
      setTimeout(() => setError(''), 3000);
    } catch (error) {
      console.error('Error adding delivery boy:', error);
      setError(error.response?.data?.message || 'Failed to add delivery boy');
    }
  };

  const handleEditDeliveryBoy = async (deliveryBoyId, deliveryBoyData) => {
    try {
      const response = await deliveryBoyAPI.updateDeliveryBoy(deliveryBoyId, deliveryBoyData);
      const updatedDeliveryBoy = response.data.deliveryBoy;
      const updatedDeliveryBoys = deliveryBoys.map(boy => 
        boy._id === deliveryBoyId ? updatedDeliveryBoy : boy
      );
      setDeliveryBoys(updatedDeliveryBoys);
      setFilteredDeliveryBoys(updatedDeliveryBoys);
      setIsEditModalOpen(false);
      setEditingDeliveryBoy(null);
      setError('✅ Delivery boy updated successfully!');
      setTimeout(() => setError(''), 3000);
    } catch (error) {
      console.error('Error updating delivery boy:', error);
      setError(error.response?.data?.message || 'Failed to update delivery boy');
    }
  };

  const handleDeleteDeliveryBoy = async (id) => {
    if (!window.confirm('Are you sure you want to delete this delivery boy?')) return;
    
    try {
      await deliveryBoyAPI.deleteDeliveryBoy(id);
      const remainingBoys = deliveryBoys.filter(boy => boy._id !== id);
      setDeliveryBoys(remainingBoys);
      setFilteredDeliveryBoys(remainingBoys);
      setError('✅ Delivery boy deleted successfully!');
      setTimeout(() => setError(''), 3000);
    } catch (error) {
      console.error('Error deleting delivery boy:', error);
      const errorMsg = error.response?.data?.message || 'Failed to delete delivery boy';
      setError(errorMsg);
    }
  };

  const openEditModal = (deliveryBoy) => {
    setEditingDeliveryBoy(deliveryBoy);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingDeliveryBoy(null);
    setIsEditModalOpen(false);
  };

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <FaCheckCircle className="mr-1" size={10} />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <FaTimesCircle className="mr-1" size={10} />
        Inactive
      </span>
    );
  };

  const deliveryBoysToRender = Array.isArray(filteredDeliveryBoys) ? filteredDeliveryBoys : [];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 w-full">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <FaTruck className="text-[#ff0000] mr-2" size={24} />
              <h1 className="text-xl font-bold text-gray-800">Delivery Boys Management</h1>
            </div>

            <div className="flex items-center">
              <button
                onClick={logout}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center"
                title="Logout"
              >
                <span className="hidden sm:inline mr-2">Logout</span>
                <FaSignOutAlt />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 sm:p-6">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-700">
              All Delivery Boys ({deliveryBoysToRender.length})
            </h2>
            <div className="flex space-x-2 sm:space-x-3 w-full sm:w-auto">
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={loading || refreshing}
                className="flex-1 sm:flex-none bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center justify-center transition duration-200 text-sm min-h-[42px] disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh delivery boys"
              >
                <FaSyncAlt className={`sm:mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </span>
              </button>
              
              {/* Add Delivery Boy Button - Only for Admin */}
              {isAdmin && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-[#ff0000] to-[#cc0000] hover:from-[#cc0000] hover:to-[#aa0000] text-white px-4 py-2 rounded-lg flex items-center justify-center transition duration-200 text-sm min-h-[42px]"
                >
                  <FaPlus className="sm:mr-2" />
                  <span className="hidden sm:inline">Add Delivery Boy</span>
                  <span className="sm:hidden">Add</span>
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className={`px-4 py-3 rounded mb-4 text-sm ${
              error.includes('✅') 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {error}
            </div>
          )}

          {/* Search and Filter Section */}
          <div className="mb-6 bg-white rounded-xl p-3 md:p-4 border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Input */}
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name, phone or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 md:py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff0000] focus:border-transparent text-sm md:text-base"
                />
              </div>
              
              {/* Status Filter */}
              <div className="sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff0000] focus:border-transparent text-sm bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Delivery Boys Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff0000] mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading delivery boys...</p>
              </div>
            ) : deliveryBoysToRender.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <FaTruck className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No delivery boys found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Try adjusting your search' : 'Click "Add Delivery Boy" to get started'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {/* Desktop/Large Tablet View */}
                <table className="hidden md:table min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        S.No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name & Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ward ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ward Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vehicle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Deliveries
                      </th>
                      {isAdmin && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {deliveryBoysToRender.map((boy, index) => (
                      <tr key={boy._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 text-center">
                            {index + 1}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {boy.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {boy.phone} | {boy.email}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <FaHashtag className="text-gray-400 mr-1" size={12} />
                            <span className="text-sm font-semibold text-gray-900">
                              {boy.wardId || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <FaMapMarkerAlt className="text-gray-400 mr-1" size={12} />
                            <span className="text-sm text-gray-700">
                              {boy.wardName || `Ward ${boy.wardId}`}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700 capitalize">
                            {boy.vehicleType}
                            {boy.vehicleNumber && (
                              <div className="text-xs text-gray-400">{boy.vehicleNumber}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(boy.status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {boy.totalDeliveries || 0}
                          </div>
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openEditModal(boy)}
                                className="bg-gradient-to-r from-[#ff0000] to-[#cc0000] hover:from-[#cc0000] hover:to-[#aa0000] text-white px-3 py-2 rounded text-sm font-medium transition duration-200 flex items-center"
                              >
                                <FaEdit className="mr-1" /> Edit
                              </button>
                              <button
                                onClick={() => handleDeleteDeliveryBoy(boy._id)}
                                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2 rounded text-sm font-medium transition duration-200 flex items-center"
                              >
                                <FaTrash className="mr-1" /> Delete
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Mobile/Small Tablet View */}
                <div className="md:hidden">
                  <div className="divide-y divide-gray-200">
                    {deliveryBoysToRender.map((boy, index) => (
                      <div key={boy._id} className="p-4 hover:bg-gray-50">
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                            {getStatusBadge(boy.status)}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {boy.name}
                          </h3>
                          <div className="text-sm text-gray-600 mt-1">
                            <div>{boy.phone}</div>
                            <div className="text-xs text-gray-400">{boy.email}</div>
                          </div>
                          <div className="flex items-center mt-2 text-sm text-gray-600">
                            <FaHashtag className="text-gray-400 mr-1" size={12} />
                            <span className="font-semibold">Ward ID:</span>
                            <span className="ml-1">{boy.wardId || 'N/A'}</span>
                          </div>
                          <div className="flex items-center mt-1 text-sm text-gray-600">
                            <FaMapMarkerAlt className="text-gray-400 mr-1" size={12} />
                            <span className="font-semibold">Ward:</span>
                            <span className="ml-1">{boy.wardName || `Ward ${boy.wardId}`}</span>
                          </div>
                          <div className="text-sm text-gray-600 capitalize mt-1">
                            Vehicle: {boy.vehicleType}
                            {boy.vehicleNumber && ` (${boy.vehicleNumber})`}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Deliveries: <span className="font-semibold">{boy.totalDeliveries || 0}</span>
                          </div>
                          
                          {isAdmin && (
                            <div className="flex space-x-2 mt-3">
                              <button
                                onClick={() => openEditModal(boy)}
                                className="bg-gradient-to-r from-[#ff0000] to-[#cc0000] hover:from-[#cc0000] hover:to-[#aa0000] text-white px-3 py-2 rounded text-sm font-medium transition duration-200 flex items-center justify-center flex-1"
                              >
                                <FaEdit className="mr-1" /> Edit
                              </button>
                              <button
                                onClick={() => handleDeleteDeliveryBoy(boy._id)}
                                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2 rounded text-sm font-medium transition duration-200 flex items-center justify-center flex-1"
                              >
                                <FaTrash className="mr-1" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Add Delivery Boy Modal */}
        <AddDeliveryBoyModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddDeliveryBoy={handleAddDeliveryBoy}
          wards={wards}
        />

        {/* Edit Delivery Boy Modal */}
        <EditDeliveryBoyModal 
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          onEditDeliveryBoy={handleEditDeliveryBoy}
          deliveryBoy={editingDeliveryBoy}
          wards={wards}
        />
      </div>
    </div>
  );
};

export default DeliveryBoys;