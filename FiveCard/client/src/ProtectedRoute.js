import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    alert('You must be logged in to access this page. Redirecting to login page...');
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;