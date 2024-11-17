import React, { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  // Function to handle login
  const login = (accessToken) => {
    localStorage.setItem('token', accessToken); // Store the token in local storage
    setToken(accessToken); // Update the state
  };

  // Function to handle logout
  const logout = () => {
    localStorage.removeItem('token'); // Clear the token from local storage
    setToken(null); // Reset the state
  };

  // Check token validity on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken); // Load the token into state
    }
  }, []);

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
