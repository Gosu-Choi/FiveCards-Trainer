import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [useremail, setUseremail] = useState('');

  useEffect(() => {
    // 컴포넌트가 마운트될 때 localStorage에서 로그인 상태를 확인
    const storedAuthState = localStorage.getItem('isAuthenticated');
    if (storedAuthState === 'true') {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = (email) => {
    setIsAuthenticated(true);
    setUseremail(email);
    localStorage.setItem('isAuthenticated', 'true'); // 로그인 상태를 localStorage에 저장
    console.log('Logged in'); // 디버깅 로그
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated'); // localStorage에서 로그인 상태 삭제
    console.log('Logged out'); // 디버깅 로그
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout, useremail }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);