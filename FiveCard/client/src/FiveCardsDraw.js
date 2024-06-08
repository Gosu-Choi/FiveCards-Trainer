import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { shuffle } from './utils'; // 섞기 함수 임포트
import './FiveCardsDraw.css'; // 스타일을 위한 CSS 파일 임포트
import 'bootstrap/dist/css/bootstrap.min.css'; // 부트스트랩 CSS 임포트

function FiveCardsDraw() {
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
  const [hands, setHands] = useState([]);
  const default_player_number = 3;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (location.state) {
      setNumber(location.state.playerCount);
    } else {
      setPlayerCount(default_player_number);
    }
  }, [location.state]);

  useEffect(() => {
    setActivePlayers(new Array(number).fill(true));
    setCardsDrawn(new Array(number).fill(0));
    setHands(new Array(number).fill([]));
  }, []);

  useEffect(() => {
    shuffleCards();
  }, []);

  const shuffleCards = () => {
    const cardFiles = [
      '2D', '3D', '4D', '5D', '6D', '7D', '8D', '9D', '10D', 'JD', 'QD', 'KD', 'AD',
      '2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C', '10C', 'JC', 'QC', 'KC', 'AC',
      '2H', '3H', '4H', '5H', '6H', '7H', '8H', '9H', '10H', 'JH', 'QH', 'KH', 'AH',
      '2S', '3S', '4S', '5S', '6S', '7S', '8S', '9S', '10S', 'JS', 'QS', 'KS', 'AS'
    ];

    const shuffled = shuffle(cardFiles);
    setShuffledCards(shuffled);
    setActivePlayers(new Array(number).fill(true));
    setCardsDrawn(new Array(number).fill(0));
    setShowFifthCard(false);
    setDeckShuffled(true);
    setHands(new Array(number).fill([]));
  };

  const drawCards = () => {
    setCardsDrawn(prevCardsDrawn => {
      return prevCardsDrawn.map((cards, index) => {
        if (activePlayers[index] && cards < 5) {
          const newHand = hands[index].concat(shuffledCards[cards + index * 5]);
          setHands(prevHands => {
            const newHands = [...prevHands];
            newHands[index] = newHand;
            return newHands;
          });
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
        let cardFilePath = `/cards/${shuffledCards[i * 5 + j]}.svg`; // 무작위로 섞인 카드 파일 경로
        if (!showFifthCard && i!=0) {
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

export default FiveCardsDraw;