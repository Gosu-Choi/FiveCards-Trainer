import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { shuffle } from './utils'; // 섞기 함수 임포트
import './FiveCardsStud.css'; // 스타일을 위한 CSS 파일 임포트
import 'bootstrap/dist/css/bootstrap.min.css'; // 부트스트랩 CSS 임포트
import { calculateHandRank, determineWinner } from './pokerHands';
import { aiDecision } from './Bot';

function FiveCardsStud() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [playerCount, setPlayerCount] = useState(null);
  const [shuffledCards, setShuffledCards] = useState([]);
  const [activePlayers, setActivePlayers] = useState([]);
  const [playershouldbet, setPlayershouldbet] = useState([]);
  const [cardsDrawn, setCardsDrawn] = useState([]);
  const [showFifthCard, setShowFifthCard] = useState(false);
  const [deckShuffled, setDeckShuffled] = useState(false);
  const [hands, setHands] = useState([]);
  const [pot, setPot] = useState(0); 
  const [raised, setRaised] = useState(null);
  const [indicator, setIndicator] = useState({present_value : null, previous_value : null});
  const default_player_number = 3;
  const [moneys, setMoneys] = useState([]);
  const default_ante = 100;
  const [is_first_operation, setIs_first_operation] = useState(true);
  const [is_beginning, setIs_beginning] = useState(false);
  const [gamestarted, setGamestarted] = useState(false);
  const [resolveFunction, setResolveFunction] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (location.state) {
      setPlayerCount(location.state.playerCount);
    } else {
      setPlayerCount(default_player_number);
    }
  }, [location.state]);

  useEffect(() => {
    if (playerCount) {
      setActivePlayers(new Array(playerCount).fill(true));
      setCardsDrawn(new Array(playerCount).fill(0));
      setHands(new Array(playerCount).fill([]));
      setMoneys(new Array(playerCount).fill(10000));
    }
  }, [playerCount]);

  useEffect(()=> {
    if (!is_first_operation){
      if (is_beginning) {
        for (let i = 0; i < playerCount; i++) {
          if (moneys[i] < default_ante) { fold(i);} 
        }
        for (let i = 0; i < playerCount; i++) {
          if (activePlayers[i]) { call(i); }
        }
        setIs_beginning(false);
      } else {
        call(indicator.present_value);
        setPlayershouldbet(prevPlayershouldbet => {
          const newPlayershouldbet = [...prevPlayershouldbet];
          for (let i = 0; i < playerCount; i++){
            if (activePlayers[i] && i!==indicator.previous_value){
              newPlayershouldbet[i] = true;
            }
          }
          return newPlayershouldbet;
        })
      }
    }
  }, [raised]) 
  // raised가 바뀌는 경우는 두 가지. 플레이어의 raise 선언 또는 게임 시작. 
  // 각각을 is_beginning으로 구분 후 코딩
  // raise 선언 시 해당 인물은 콜, 폴드하지 않은 모든 다른 사람의 베팅 의무 발생 (playershouldbet)

  useEffect(() => {
    if (gamestarted) {
      const gameLoop = async () => {
        while (activePlayers.filter(person => person === true).length > 1) {
          await drawCards(); // 카드를 드로우하고 나서
          await handleBettingRound(); // 베팅 라운드를 처리함
        }
      };
      gameLoop();
    }
  }, [gamestarted]);

  useEffect(() => {
    console.log("useEffect triggered");
    if(!is_first_operation && !is_beginning){
      console.log("useEffect faced something");
      if (indicator.present_value !== 0 && resolveFunction) {
        console.log(indicator.present_value);
        resolveFunction();
      }
    } 
  }, [indicator.present_value]);

  const nullingresolvefunction = async() => {
    setResolveFunction(null);
  }

  const waitForPlayerDecision = async() => {
    return new Promise(resolve => {
      setResolveFunction(() => {
        const internal = async() => {
          await nullingresolvefunction();
          resolve();
          console.log('resolved');
        }
        return internal;
      });
    });
  };

  const handleBettingRound = async () => {
    while (!playershouldbet.some(person => person === true)){
      console.log("former : ", indicator.present_value); 
      if (indicator.present_value === 0){
        await waitForPlayerDecision();
        await new Promise(resolve => setTimeout(resolve, 0));
        console.log("right after : ", indicator.present_value);
      } else {
        const decision = aiDecision();
        if (decision === 'call') {
          call(indicator.present_value);
        } else if (decision === 'fold') {
          fold(indicator.present_value);
        } else {
          raise(indicator.present_value); // I am not using this for now (Adjusted Bot.js)
        }
      }
      console.log("latter : ", indicator.present_value);   
    }
  };



  const shuffleCards = () => {
    const cardFiles = [
      '2D', '3D', '4D', '5D', '6D', '7D', '8D', '9D', '10D', 'JD', 'QD', 'KD', 'AD',
      '2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C', '10C', 'JC', 'QC', 'KC', 'AC',
      '2H', '3H', '4H', '5H', '6H', '7H', '8H', '9H', '10H', 'JH', 'QH', 'KH', 'AH',
      '2S', '3S', '4S', '5S', '6S', '7S', '8S', '9S', '10S', 'JS', 'QS', 'KS', 'AS'
    ];

    const shuffled = shuffle(cardFiles);
    change_indicator(0) // 항상 플레이어가 베팅 보스

    setShuffledCards(shuffled);
    setDeckShuffled(true);
    setShowFifthCard(false);
    setCardsDrawn(new Array(playerCount).fill(0));
    setHands(new Array(playerCount).fill([]));
    setActivePlayers(new Array(playerCount).fill(true));
    setIs_beginning(true);
    setPot(0);
    setRaised(default_ante);
    setIs_first_operation(false);
    setGamestarted(true);
  };

  const fold = async (playerIndex) => {
    setActivePlayers(prevActivePlayers => {
      const newActivePlayers = [...prevActivePlayers];
      newActivePlayers[playerIndex] = false;
      return newActivePlayers;
    });
    setPlayershouldbet(prevPlayershouldbet => {
      const newPlayershouldbet = [...prevPlayershouldbet];
      newPlayershouldbet[playerIndex] = false;
      return newPlayershouldbet;
    })
  };

  const call = async (playerIndex) => {
    if (moneys[playerIndex] > raised) {
      setPot(prevPot => prevPot + raised); 
    } else { //All-in
      setPot(prevPot => prevPot + moneys[playerIndex]);
    }

    const newMoney = ( moneys[playerIndex] - raised > 0 ? moneys[playerIndex] - raised : 0 )
    setMoneys(prevMoneys => {
      const newMoneys = [...prevMoneys];
      newMoneys[playerIndex] = newMoney;
      return newMoneys;
    })

    setPlayershouldbet(prevPlayershouldbet => {
      const newPlayershouldbet = [...prevPlayershouldbet];
      newPlayershouldbet[playerIndex] = false;
      return newPlayershouldbet;
    })

    await inc_indicator();
  };

  const inc_indicator = async() => {
    console.log("indicator has been increased");
    setIndicator(prevIndicator => {
      let newIndicator = prevIndicator.present_value + 1;
      let round = 0;
      while (!activePlayers[newIndicator]) {
        newIndicator++;
        if (newIndicator > playerCount-1) {
          newIndicator = 0;
          round++;
        }
        if (round > 2){ // game over
          return {
            present_value: null,
            previous_value: prevIndicator.present_value
          };
        }
      }
      return {
        present_value: newIndicator,
        previous_value: prevIndicator.present_value
      };
    });
  }

  const change_indicator = ((ch) => {
    setIndicator(prevIndicator => {
      return {present_value:ch, previous_value:prevIndicator.present_value}
    });
  })

  const raise = async(playerIndex) => {
    if (moneys[playerIndex] > pot*1.5) {
      setRaised(pot*1.5);
    } else { //All-in
      setRaised(moneys[playerIndex]);
    }
  };

  const drawCards = async() => {
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

  const handleOpen = () => {
    const allCardsDrawn = cardsDrawn.some(cards => cards === 5);
    if (allCardsDrawn) {
      setShowFifthCard(true);
    }
    setRaised(0);
    setGamestarted(false);
  };

  const renderBoxes = () => {
    if (playerCount === null) return null;

    const boxes = [];
    const angleIncrement = 360 / playerCount;

    for (let i = 0; i < playerCount; i++) {
      const angle = angleIncrement * i + 180; // 180도 회전하여 원 아래가 첫 번째 지점이 되도록 설정
      const x = 50 + 40 * Math.cos((angle - 90) * (Math.PI / 180)); // X 좌표
      const y = 50 + 40 * Math.sin((angle - 90) * (Math.PI / 180)); // Y 좌표

      for (let j = 0; j < cardsDrawn[i]; j++) {
        const boxX = x + 5 * (j - 2); // 가로로 배치, -2는 중앙 정렬을 위해
        let cardFilePath = `/cards/${shuffledCards[j + i * 5]}.svg`; // 무작위로 섞인 카드 파일 경로

        if (i !== 0 && j === 4 && !showFifthCard) {
          cardFilePath = `/cards/card_back.svg`;
        }

        boxes.push(
          <div
            key={`${i}-${j}`}
            className="box"
            style={{ left: `${boxX}%`, top: `${y}%` }}
          >
            <div className="card-slot">
              <img src={cardFilePath} alt={`Card ${j + i * 5}`} className="card-image" />
            </div>
          </div>
        );
      }
      if (i!==0){
        boxes.push(
          <div
            key={`Player-${i}`}
            className={`btn btn-sm fold-button ${indicator.present_value == i ? 'btn-primary' : !activePlayers[i] ? 'btn-secondary' : 'btn-outline-danger'}`}
            style={{ left: `${x-5}%`, top: `${y - 11}%` }} // 원의 각 지점보다 약간 위에 둠
          >
            Bot {i} : {moneys[i]}
          </div>
        );
      } else {
        boxes.push(
          <div
            key={`Player-${i}`}
            className={`btn btn-sm fold-button ${indicator.present_value == i ? 'btn-primary' : !activePlayers[i] ? 'btn-secondary' : 'btn-outline-danger'}`}
            style={{ left: `${x-5}%`, top: `${y - 11}%` }} // 원의 각 지점보다 약간 위에 둠
          >
            Player : {moneys[i]}
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
        <div className="button-container">
          Pot: {pot}
          <button
            className={`btn btn-sm ${deckShuffled ? 'btn-primary' : 'btn-secondary'} shuffle-button`}
            onClick={shuffleCards}
            disabled={deckShuffled && !showFifthCard}
          >
            New Game
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
            disabled={!cardsDrawn.some(cards => cards === 5) || showFifthCard}
          >
            Open
          </button>
          <div className="action-buttons">
            <button
              className="btn btn-sm btn-warning action-button"
              onClick={() => call(0)} // 플레이어가 콜
              disabled={indicator.present_value !== 0}
            >
              Call
            </button>
            <button
              className="btn btn-sm btn-danger action-button"
              onClick={() => raise(0)} // 플레이어가 레이즈
              disabled={indicator.present_value !== 0}
            >
              Raise
            </button>
            <button
              className="btn btn-sm btn-secondary action-button"
              onClick={() => fold(0)} // 플레이어가 폴드
              disabled={indicator.present_value !== 0}
            >
              Fold
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FiveCardsStud;