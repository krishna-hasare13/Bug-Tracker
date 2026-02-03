import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. INITIALIZE ON LOAD
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // ✅ VITAL: Attach token to all requests automatically on reload
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  // 2. LOGIN FUNCTION (Handles API Call + Token Setup)
  const login = async (email, password) => {
    try {
      // Make the request
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      
      // Save to LocalStorage
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      // ✅ VITAL: Attach token immediately to Axios for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
      // Update State
      setUser(res.data.user);
      
      return res.data;
    } catch (err) {
      console.error("Login Error:", err.response?.data?.error);
      throw err; // Propagate error so Login.jsx can show an alert
    }
  };

  // 3. LOGOUT FUNCTION
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // ✅ CLEANUP: Remove token header so next user isn't using old credentials
    delete axios.defaults.headers.common['Authorization'];
    
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};