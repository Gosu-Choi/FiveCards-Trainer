import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [useremail, setUseremail] = useState('');
  const [playerMoney, setPlayerMoney] = useState(0);

  useEffect(() => {
    // 컴포넌트가 마운트될 때 localStorage에서 로그인 상태를 확인
    const storedAuthState = localStorage.getItem('isAuthenticated');
    const storedEmail = localStorage.getItem('email');
    const storedMoney = localStorage.getItem('money');
    // if (storedAuthState === 'true') { 
    //for test
      setIsAuthenticated(true);
      setUseremail(storedEmail);
      setPlayerMoney(storedMoney);
    // }
    setLoading(false);
  }, []);

  const login = (email, money) => {
    setIsAuthenticated(true);
    setUseremail(email);
    setPlayerMoney(money);
    localStorage.setItem('isAuthenticated', 'true'); // 로그인 상태를 localStorage에 저장
    localStorage.setItem('email', email);
    localStorage.setItem('money', money);
  };

  const refreshmoney = (money) => {
    setPlayerMoney(money);
    localStorage.setItem('money', money);
  }

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated'); // localStorage에서 로그인 상태 삭제
    localStorage.removeItem('email');
    localStorage.removeItem('money');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout, useremail, playerMoney, refreshmoney }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);