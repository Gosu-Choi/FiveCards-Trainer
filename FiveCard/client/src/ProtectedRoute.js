import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>; // 로딩 중일 때 표시할 내용
  }

  if (!isAuthenticated) {
    alert('You must be logged in to access this page. Redirecting to login page...');
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;