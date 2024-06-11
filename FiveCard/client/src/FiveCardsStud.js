import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { shuffle } from './utils'; // 섞기 함수 임포트
import './FiveCardsStud.css'; // 스타일을 위한 CSS 파일 임포트
import 'bootstrap/dist/css/bootstrap.min.css'; // 부트스트랩 CSS 임포트
import { calculateHandRank, determineWinner } from './pokerHands';
import { aiDecision } from './Bot';

function FiveCardsStud() {
  const default_player_number = 3;
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [playerCount, setPlayerCount] = useState(default_player_number);
  const [shuffledCards, setShuffledCards] = useState([]);
  const [activePlayers, setActivePlayers] = useState([]);
  const [playershouldbet, setPlayershouldbet] = useState([]);
  const [cardsDrawn, setCardsDrawn] = useState([]);
  const [showFifthCard, setShowFifthCard] = useState(false);
  const [deckShuffled, setDeckShuffled] = useState(false);
  const [hands, setHands] = useState([]);
  const [pot, setPot] = useState(0); 
  const [raised, setRaised] = useState(null);
  const [indicator, setIndicator] = useState(null);
  const [moneys, setMoneys] = useState([]);
  const default_ante = 100;
  const [is_first_operation, setIs_first_operation] = useState(true);
  const [is_beginning, setIs_beginning] = useState(false);
  const [gamestarted, setGamestarted] = useState(false);
  const [resolveFunction, setResolveFunction] = useState(null);

  const indicatorRef = useRef(indicator);
  const playershouldbetRef = useRef(playershouldbet);
  const moneysRef = useRef(moneys);
  moneysRef.current = moneys;
  const activePlayersRef = useRef(activePlayers);
  const gamestartedRef = useRef(gamestarted);

  useEffect(() => {
    indicatorRef.current = indicator;
  }, [indicator]);

  useEffect(() => {
    activePlayersRef.current = activePlayers;
  }, [activePlayers]);

  useEffect(() => {
    playershouldbetRef.current = playershouldbet;
  }, [playershouldbet]);

  useEffect(() => {
    moneysRef.current = moneys;
  }, [moneys]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (location.state) {
      setPlayerCount(location.state.playerCount);
    }
  }, [location.state]);

  useEffect(() => {
    if (playerCount) {
      setActivePlayers(new Array(playerCount).fill(true));
      setPlayershouldbet(new Array(playerCount).fill(true));
      setCardsDrawn(new Array(playerCount).fill(0));
      setHands(new Array(playerCount).fill([]));
      setMoneys(new Array(playerCount).fill(10000));
    }
  }, [playerCount]);

  useEffect(()=> {
    if (!is_first_operation){
      if (is_beginning) {
        const beginning_func = async() => {
          console.log("playershouldbet: ", playershouldbetRef.current);
          console.log("indicator: ", indicatorRef.current);
          while (playershouldbetRef.current.some(person => person === true)){
            if (moneys[indicatorRef.current] < default_ante){
              await fold(indicatorRef.current);
            } else {
              await call(indicatorRef.current);
              console.log("playershouldbet: ", playershouldbetRef.current);
              console.log("indicator: ", indicatorRef.current);
            }
          }
          setIs_beginning(false);
          setGamestarted(true);
        }
        beginning_func();
      } else {
        const betduty = async() => {
          await setPlayershouldbetfunc(0);
          call(indicatorRef.current);
        }
        betduty();
      }
    }
  }, [raised]) 
  // raised가 바뀌는 경우는 두 가지. 플레이어의 raise 선언 또는 게임 시작. 
  // 각각을 is_beginning으로 구분 후 코딩
  // raise 선언 시 해당 인물은 콜, 폴드하지 않은 모든 다른 사람의 베팅 의무 발생 (playershouldbet)

  useEffect(() => {
    gamestartedRef.current = gamestarted;
    if (gamestartedRef.current) {
      const gameLoop = async () => {
        while (activePlayersRef.current.filter(person => person === true).length > 1) {
          console.log(moneysRef.current);
          await change_indicator(0); // 탑을 베팅 보스로 설정 필요. 일단 플레이어 베팅 보스
          await setPlayershouldbetfunc(1);
          await drawCards();
          await handleBettingRound(); 
        }
      };
      gameLoop();
      setGamestarted(false); // 종료 시 판돈 지급 및 gamestarted 재설정 필요
    }
  }, [gamestarted]);

  useEffect(() => {
    if(!is_first_operation && !is_beginning){
      if (indicatorRef.current !== 0 && resolveFunction) {
        resolveFunction();
      }
    } 
  }, [indicator]);

  const setPlayershouldbetfunc = async(i) => {
    if (i === 0){
      const duty0 = async() => {
        setPlayershouldbet(prevPlayershouldbet => {
          const newPlayershouldbet = [...prevPlayershouldbet];
          for (let i = 0; i < playerCount; i++){
            if (activePlayersRef.current[i] && i!==indicatorRef.current){
              newPlayershouldbet[i] = true;
            }
          }
          return newPlayershouldbet;
        });
      }
      await duty0();
    } else {
      const duty1 = async() => {
        setPlayershouldbet(prevPlayershouldbet => {
          const newPlayershouldbet = [...prevPlayershouldbet];
          for (let i = 0; i < playerCount; i++){
            if (activePlayersRef.current[i]){
              newPlayershouldbet[i] = true;
            }
          }
          return newPlayershouldbet;
        });
      }
      await duty1();
    }
  }

  const nullingresolvefunction = async() => {
    setResolveFunction(null);
  }

  const waitForPlayerDecision = async() => {
    return new Promise(resolve => {
      setResolveFunction(() => {
        const internal = async() => {
          await nullingresolvefunction();
          resolve();
        }
        return internal;
      });
    });
  };

  const handleBettingRound = async () => {
    while (playershouldbetRef.current.some(person => person === true)){
      if (indicatorRef.current === 0){
        await waitForPlayerDecision();
      } else {
        const decision = await aiDecision();
        console.log("bot", indicatorRef.current, " decision:", decision);
        if (decision.decision === 'call') {
          await call(indicatorRef.current);
          console.log('executed call for bot ', indicatorRef.current);
        } else if (decision.decision === 'fold') {
          await fold(indicatorRef.current);
          console.log('executed fold for bot ', indicatorRef.current);
        } else {
          await raise(indicatorRef.current); // I am not using this for now (Adjusted Bot.js)
          console.log('executed raise for bot ', indicatorRef.current);
        }
      }
      console.log(playershouldbetRef.current);
    }
  };



  const shuffleCards = async() => {
    const cardFiles = [
      '2D', '3D', '4D', '5D', '6D', '7D', '8D', '9D', '10D', 'JD', 'QD', 'KD', 'AD',
      '2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C', '10C', 'JC', 'QC', 'KC', 'AC',
      '2H', '3H', '4H', '5H', '6H', '7H', '8H', '9H', '10H', 'JH', 'QH', 'KH', 'AH',
      '2S', '3S', '4S', '5S', '6S', '7S', '8S', '9S', '10S', 'JS', 'QS', 'KS', 'AS'
    ];

    const shuffled = shuffle(cardFiles); 

    setShuffledCards(shuffled);
    setDeckShuffled(true);
    setShowFifthCard(false);
    setCardsDrawn(new Array(playerCount).fill(0));
    setHands(new Array(playerCount).fill([]));
    setActivePlayers(new Array(playerCount).fill(true));
    setIs_beginning(true);
    setPot(0);
    setIs_first_operation(false);
    await change_indicator(0);
    setRaised(default_ante);
  };

  const fold = async (playerIndex) => {
    setActivePlayers(prevActivePlayers => {
      const newActivePlayers = [...prevActivePlayers];
      newActivePlayers[playerIndex] = false;
      return newActivePlayers;
    });
    
    const duty = async() => {
      setPlayershouldbet(prevPlayershouldbet => {
        const newPlayershouldbet = [...prevPlayershouldbet];
        newPlayershouldbet[playerIndex] = false;
        return newPlayershouldbet;
      });
    }
    await duty();
    await inc_indicator();
  };

  const call = async (playerIndex) => {
    if (moneysRef.current[playerIndex] > raised) {
      setPot(prevPot => prevPot + raised); 
    } else { //All-in
      setPot(prevPot => prevPot + moneysRef.current[playerIndex]);
    }
   
    const newMoney = ( moneysRef.current[playerIndex] - raised > 0 ? moneysRef.current[playerIndex] - raised : 0 )
    setMoneys(prevMoneys => {
      const newMoneys = [...prevMoneys];
      newMoneys[playerIndex] = newMoney;
      return newMoneys;
    });

    const duty = async() => {
        setPlayershouldbet(prevPlayershouldbet => {
          const newPlayershouldbet = [...prevPlayershouldbet];
          newPlayershouldbet[playerIndex] = false;
          return newPlayershouldbet;
      });
    }
    await duty();
    await inc_indicator();
  };

  const inc_indicator = async() => {
    setIndicator(prevIndicator => {
      console.log("Old indicator value: ", prevIndicator);
      let newIndicator = prevIndicator + 1;
      let round = 0;
      while (!playershouldbetRef.current[newIndicator]) {
        newIndicator++;
        if (newIndicator > playerCount-1) {
          newIndicator = 0;
          round++;
        }
        if (round > 3){ // betting round over
          return null;
        }
      }
      console.log("New indicator value: ", newIndicator);
      return newIndicator;
    });
  }

  const change_indicator = (async(ch) => {
    setIndicator(ch);
  });

  const raise = async(playerIndex) => {
    if (moneys[playerIndex] > pot*1.5) {
      setRaised(pot*1.5);
    } else { //All-in
      setRaised(moneys[playerIndex]);
    }

    await inc_indicator();
  };

  const drawCards = async() => {
    setCardsDrawn(prevCardsDrawn => {
      return prevCardsDrawn.map((cards, index) => {
        if (activePlayersRef.current[index] && cards < 5) {
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
            className={`btn btn-sm fold-button ${indicatorRef.current == i ? 'btn-primary' : !activePlayersRef.current[i] ? 'btn-secondary' : 'btn-outline-danger'}`}
            style={{ left: `${x-5}%`, top: `${y - 11}%` }} // 원의 각 지점보다 약간 위에 둠
          >
            Bot {i} : {moneysRef.current[i]}
          </div>
        );
      } else {
        boxes.push(
          <div
            key={`Player-${i}`}
            className={`btn btn-sm fold-button ${indicatorRef.current == i ? 'btn-primary' : !activePlayersRef.current[i] ? 'btn-secondary' : 'btn-outline-danger'}`}
            style={{ left: `${x-5}%`, top: `${y - 11}%` }} // 원의 각 지점보다 약간 위에 둠
          >
            Player : {moneysRef.current[i]}
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
            disabled={deckShuffled && gamestartedRef.current}
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
            disabled={!cardsDrawn.some(cards => cards === 5) || !gamestartedRef.current}
          >
            Open
          </button>
          <div className="action-buttons">
            <button
              className="btn btn-sm btn-warning action-button"
              onClick={() => call(0)} // 플레이어가 콜
              disabled={indicatorRef.current !== 0}
            >
              Call
            </button>
            <button
              className="btn btn-sm btn-danger action-button"
              onClick={() => raise(0)} // 플레이어가 레이즈
              disabled={indicatorRef.current !== 0}
            >
              Raise
            </button>
            <button
              className="btn btn-sm btn-secondary action-button"
              onClick={() => fold(0)} // 플레이어가 폴드
              disabled={indicatorRef.current !== 0}
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