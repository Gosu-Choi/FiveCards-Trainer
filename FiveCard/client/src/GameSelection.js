import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './GameSelection.css'; // 스타일을 위한 CSS 파일 임포트

function GameSelection() {
  const [playerCount, setPlayerCount] = useState(null);
  const [gameType, setGameType] = useState(null);
  const navigate = useNavigate();

  const handleStart = () => {
    if (!playerCount || !gameType) {
      alert('Both player count and game type are required.');
    } else {
      navigate(`/${gameType.replace('-', '').replace('-', '')}`, { state: { playerCount } });
    }
  };

  return (
    <div className="selection-container">
      <div className="question">
        <h2>Select number of players:</h2>
        <div className="button-group">
          {[2, 3, 4, 5, 6].map(count => (
            <button
              key={count}
              className={`btn ${playerCount === count ? 'btn-success' : 'btn-outline-primary'}`}
              onClick={() => setPlayerCount(count)}
            >
              {count}
            </button>
          ))}
        </div>
      </div>
      <div className="question">
        <h2>Select game type:</h2>
        <div className="button-group">
          {['Five-Cards-Stud', 'Five-Cards-Draw', 'Seven-Poker', 'Holdem'].map(type => (
            <button
              key={type}
              className={`btn ${gameType === type ? 'btn-success' : 'btn-outline-primary'}`}
              onClick={() => setGameType(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      <button className="btn btn-primary start-button" onClick={handleStart}>
        Start
      </button>
    </div>
  );
}

export default GameSelection;
