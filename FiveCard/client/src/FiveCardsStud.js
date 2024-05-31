import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { shuffle } from './utils'; // 섞기 함수 임포트
import './FiveCardsStud.css'; // 스타일을 위한 CSS 파일 임포트
import 'bootstrap/dist/css/bootstrap.min.css'; // 부트스트랩 CSS 임포트

function FiveCardsStud() {
  const { isAuthenticated } = useAuth();
  const [number, setNumber] = useState(null);
  const location = useLocation();
  const [shuffledCards, setShuffledCards] = useState([]);
  const [activePlayers, setActivePlayers] = useState([]);
  const [cardsDrawn, setCardsDrawn] = useState([]);
  const navigate = useNavigate();
  const [playerCount, setPlayerCount] = useState(null);
  const [showFifthCard, setShowFifthCard] = useState(false);
  const [deckShuffled, setDeckShuffled] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (location.state) {
      setNumber(location.state.playerCount);
    }
  }, [location.state]);

  useEffect(() => {
    setActivePlayers(new Array(number).fill(true));
    setCardsDrawn(new Array(number).fill(0));
  }, []);

  useEffect(() => {
    shuffleCards();
  }, []);

  const shuffleCards = () => {
    const cardFiles = [
      'diamonds_2.svg', 'diamonds_3.svg', 'diamonds_4.svg', 'diamonds_5.svg', 'diamonds_6.svg', 'diamonds_7.svg', 'diamonds_8.svg', 'diamonds_9.svg', 'diamonds_10.svg', 'diamonds_J.svg', 'diamonds_Q.svg', 'diamonds_K.svg', 'diamonds_A.svg',
      'spades_2.svg', 'spades_3.svg', 'spades_4.svg', 'spades_5.svg', 'spades_6.svg', 'spades_7.svg', 'spades_8.svg', 'spades_9.svg', 'spades_10.svg', 'spades_J.svg', 'spades_Q.svg', 'spades_K.svg', 'spades_A.svg',
      'hearts_2.svg', 'hearts_3.svg', 'hearts_4.svg', 'hearts_5.svg', 'hearts_6.svg', 'hearts_7.svg', 'hearts_8.svg', 'hearts_9.svg', 'hearts_10.svg', 'hearts_J.svg', 'hearts_Q.svg', 'hearts_K.svg', 'hearts_A.svg',
      'clubs_2.svg', 'clubs_3.svg', 'clubs_4.svg', 'clubs_5.svg', 'clubs_6.svg', 'clubs_7.svg', 'clubs_8.svg', 'clubs_9.svg', 'clubs_10.svg', 'clubs_J.svg', 'clubs_Q.svg', 'clubs_K.svg', 'clubs_A.svg'
    ];

    const shuffled = shuffle(cardFiles);
    setShuffledCards(shuffled);
    setActivePlayers(new Array(number).fill(true));
    setCardsDrawn(new Array(number).fill(0));
    setShowFifthCard(false);
    setDeckShuffled(true);
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

  const handleOpen = () => {
    const allCardsDrawn = cardsDrawn.some(cards => cards === 5);
    if (allCardsDrawn) {
      setShowFifthCard(true);
    }
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
        let cardFilePath = `/cards/${shuffledCards[i * 5 + j]}`; // 무작위로 섞인 카드 파일 경로
        if (j === 4 && !showFifthCard && i!=0) {
          cardFilePath = `/cards/Card_back.svg`;
        }
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
          <button
            className={`btn btn-sm ${deckShuffled ?  'btn-primary' : 'btn-secondary'} shuffle-button`}
            onClick={shuffleCards}
            disabled={deckShuffled&&!showFifthCard}
          >
            Shuffle
          </button>
          <button
            className={`btn btn-sm ${deckShuffled ? 'btn-primary' : 'btn-secondary'} continue-button`}
            onClick={drawCards}
            disabled={!deckShuffled || cardsDrawn.some(cards => cards >= 5)}
          >
            Continue
          </button>
          <button
            className={`btn btn-sm ${cardsDrawn.some(cards => cards === 5) ? 'btn-primary' : 'btn-secondary'} open-button`}
            onClick={handleOpen}
            disabled={!cardsDrawn.some(cards => cards === 5)||showFifthCard}
          >
            Open
          </button>
        </div>
      </div>
    </div>
  );
}

export default FiveCardsStud;