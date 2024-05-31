import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function Game() {
  const { isAuthenticated } = useAuth();
  const [number, setNumber] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    let userNumber;
    do {
      userNumber = prompt("Please enter a number:");
    } while (userNumber === null || userNumber.trim() === "");
    setNumber(userNumber);
  }, []);

  return (
    <div className="container">
      <h1>Welcome to the Game Page</h1>
      <p>Your number is: {number}</p>
    </div>
  );
}

export default Game;