import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './Game.css'; // 스타일을 위한 CSS 파일 임포트

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
      userNumber = prompt("Please enter a natural number less than or equal to 6:");
    } while (
      userNumber === null || 
      !/^[1-6]$/.test(userNumber) || 
      parseInt(userNumber, 10) < 1 || 
      parseInt(userNumber, 10) > 6
    );
    setNumber(parseInt(userNumber, 10));
  }, []);

  const renderBoxes = () => {
    if (number === null) return null;

    const boxes = [];
    const angleIncrement = 360 / number;

    for (let i = 0; i < number; i++) {
      const angle = angleIncrement * i;
      const x = 50 + 40 * Math.cos((angle - 90) * (Math.PI / 180)); // X 좌표
      const y = 50 + 40 * Math.sin((angle - 90) * (Math.PI / 180)); // Y 좌표

      for (let j = 0; j < 5; j++) {
        const boxX = x + 5 * (j - 2); // 가로로 배치, -2는 중앙 정렬을 위해
        boxes.push(
          <div
            key={`${i}-${j}`}
            className="box"
            style={{ left: `${boxX}%`, top: `${y}%` }}
          >
            <div className="card-slot"></div>
          </div>
        );
      }
    }

    return boxes;
  };

  return (
    <div className="game-container">
      <div className="circle">
        {renderBoxes()}
      </div>
    </div>
  );
}

export default Game;