import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { shuffle } from './utils'; // 섞기 함수 임포트
import './Game.css'; // 스타일을 위한 CSS 파일 임포트
import 'bootstrap/dist/css/bootstrap.min.css'; // 부트스트랩 CSS 임포트

function Game() {
  const { isAuthenticated } = useAuth();
  const [number, setNumber] = useState(null);
  const [shuffledCards, setShuffledCards] = useState([]);
  const [activePlayers, setActivePlayers] = useState([]);
  const [cardsDrawn, setCardsDrawn] = useState([]);
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
    setActivePlayers(new Array(parseInt(userNumber, 10)).fill(true));
    setCardsDrawn(new Array(parseInt(userNumber, 10)).fill(0));
  }, []);

  useEffect(() => {
    shuffleCards();
  }, []);

  const shuffleCards = () => {
    const cardFiles = [
      'diamonds_2.png', 'diamonds_3.png', 'diamonds_4.png', 'diamonds_5.png', 'diamonds_6.png', 'diamonds_7.png', 'diamonds_8.png', 'diamonds_9.png', 'diamonds_10.png', 'diamonds_J.png', 'diamonds_Q.png', 'diamonds_K.png', 'diamonds_A.png',
      'spades_2.png', 'spades_3.png', 'spades_4.png', 'spades_5.png', 'spades_6.png', 'spades_7.png', 'spades_8.png', 'spades_9.png', 'spades_10.png', 'spades_J.png', 'spades_Q.png', 'spades_K.png', 'spades_A.png',
      'hearts_2.png', 'hearts_3.png', 'hearts_4.png', 'hearts_5.png', 'hearts_6.png', 'hearts_7.png', 'hearts_8.png', 'hearts_9.png', 'hearts_10.png', 'hearts_J.png', 'hearts_Q.png', 'hearts_K.png', 'hearts_A.png',
      'clubs_2.png', 'clubs_3.png', 'clubs_4.png', 'clubs_5.png', 'clubs_6.png', 'clubs_7.png', 'clubs_8.png', 'clubs_9.png', 'clubs_10.png', 'clubs_J.png', 'clubs_Q.png', 'clubs_K.png', 'clubs_A.png'
    ];

    const shuffled = shuffle(cardFiles);
    setShuffledCards(shuffled);
    setActivePlayers(new Array(number).fill(true));
    setCardsDrawn(new Array(number).fill(0));
  };

  const drawCards = () => {
    setCardsDrawn(prevCardsDrawn => {
      return prevCardsDrawn.map((cards, index) => {
        if (activePlayers[index] && cards < 5) {
          return cards + 1;
        }
        return cards;
      });
    });
  };

  const foldPlayer = (index) => {
    setActivePlayers(prevActivePlayers => {
      const newActivePlayers = [...prevActivePlayers];
      newActivePlayers[index] = false;
      return newActivePlayers;
    });
  };

  const renderBoxes = () => {
    if (number === null) return null;

    const boxes = [];
    const angleIncrement = 360 / number;

    for (let i = 0; i < number; i++) {
      const angle = angleIncrement * i + 180; // 180도 회전하여 원 아래가 첫 번째 지점이 되도록 설정
      const x = 50 + 40 * Math.cos((angle - 90) * (Math.PI / 180)); // X 좌표
      const y = 50 + 40 * Math.sin((angle - 90) * (Math.PI / 180)); // Y 좌표

      for (let j = 0; j < cardsDrawn[i]; j++) {
        const boxX = x + 5 * (j - 2); // 가로로 배치, -2는 중앙 정렬을 위해
        const cardFilePath = `/cards/${shuffledCards[i * 5 + j]}`; // 무작위로 섞인 카드 파일 경로

        boxes.push(
          <div
            key={`${i}-${j}`}
            className="box"
            style={{ left: `${boxX}%`, top: `${y}%` }}
          >
            <div className="card-slot">
              <img src={cardFilePath} alt={`Card ${i * 5 + j}`} className="card-image" />
            </div>
          </div>
        );
      }

      boxes.push(
        <button
          key={`fold-${i}`}
          className={`btn btn-sm fold-button ${!activePlayers[i] ? 'btn-secondary' : 'btn-outline-danger'}`}
          style={{ left: `${x-5}%`, top: `${y - 11}%` }} // 원의 각 지점보다 약간 위에 둠
          onClick={() => foldPlayer(i)}
        >
          Fold
        </button>
      );
    }

    return boxes;
  };

  return (
    <div className="game-container">
      <div className="circle">
        {renderBoxes()}
        <div className="button-container">
          <button className="btn btn-sm btn-secondary shuffle-button" onClick={shuffleCards}>Shuffle</button>
          <button className="btn btn-sm btn-primary continue-button" onClick={drawCards}>Continue</button>
        </div>
      </div>
    </div>
  );
}

export default Game;