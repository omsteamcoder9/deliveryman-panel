// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { deliveryBoyAPI } from '../api/deliveryBoy';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [deliveryBoy, setDeliveryBoy] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();  // This will work now because Router is parent

  useEffect(() => {
    const token = localStorage.getItem('deliveryToken');
    const savedDeliveryBoy = localStorage.getItem('deliveryBoy');
    
    if (token && savedDeliveryBoy) {
      setDeliveryBoy(JSON.parse(savedDeliveryBoy));
    }
    setLoading(false);
  }, []);

  const login = async (phone, password) => {
    try {
      const response = await deliveryBoyAPI.login({ phone, password });
      const { token, deliveryBoy } = response.data;
      
      localStorage.setItem('deliveryToken', token);
      localStorage.setItem('deliveryBoy', JSON.stringify(deliveryBoy));
      setDeliveryBoy(deliveryBoy);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('deliveryToken');
    localStorage.removeItem('deliveryBoy');
    setDeliveryBoy(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ deliveryBoy, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};