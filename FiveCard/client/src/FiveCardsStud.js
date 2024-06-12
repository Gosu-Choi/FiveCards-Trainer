import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { shuffle } from './utils'; // 섞기 함수 임포트
import './FiveCardsStud.css'; // 스타일을 위한 CSS 파일 임포트
import 'bootstrap/dist/css/bootstrap.min.css'; // 부트스트랩 CSS 임포트
import { calculateHandRank, determineWinner, facemaker } from './pokerHands';
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
  const [turnmoneymanage, setTurnmoneymanage] = useState([]);
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
  const [resolveFunction2, setResolveFunction2] = useState(null);
  const [turn, setTurn] = useState(false);
  const [betting_round, setBetting_round] = useState(1);
  const [winner_index, setWinner_index] = useState(null);

  const showFifthCardRef = useRef(showFifthCard);
  const handsRef = useRef(hands);
  const winner_indexRef = useRef(winner_index);
  const betting_roundRef = useRef(betting_round);
  const potRef = useRef(pot);
  const turnRef = useRef(turn);
  const turnmoneymanageRef = useRef(turnmoneymanage);
  turnmoneymanageRef.current = turnmoneymanage;
  const raisedRef = useRef(raised);
  const indicatorRef = useRef(indicator);
  const playershouldbetRef = useRef(playershouldbet);
  const moneysRef = useRef(moneys);
  moneysRef.current = moneys;
  const activePlayersRef = useRef(activePlayers);
  const gamestartedRef = useRef(gamestarted);

  useEffect(() => {
    showFifthCardRef.current = showFifthCard;
  }, [showFifthCard]);

  useEffect(() => {
    winner_indexRef.current = winner_index;
  }, [winner_index]);

  useEffect(() => {
    handsRef.current = hands;
  }, [hands]);

  useEffect(() => {
    betting_roundRef.current = betting_round;
  }, [betting_round]);

  useEffect(() => {
    indicatorRef.current = indicator;
  }, [indicator]);

  useEffect(() => {
    potRef.current = pot;
  }, [pot]);

  useEffect(() => {
    turnmoneymanageRef.current = turnmoneymanage;
  }, [turnmoneymanage]);

  useEffect(() => {
    turnRef.current = turn;
  }, [turn]);

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
      setTurnmoneymanage(new Array(playerCount).fill(0));
    }
  }, [playerCount]);

  useEffect(()=> {
    raisedRef.current = raised;
    if (!is_first_operation){
      if (is_beginning) {
        const beginning_func = async() => {
          await drawCards();
          while (playershouldbetRef.current.some(person => person === true)){
            if (moneys[indicatorRef.current] < default_ante){
              await fold(indicatorRef.current);
            } else {
              await call(indicatorRef.current);
            }
          }
          setIs_beginning(false);
          setGamestarted(true);
        }
        beginning_func();
      } 
    }
  }, [raised])

  useEffect(() => {
    gamestartedRef.current = gamestarted;
    if (gamestartedRef.current) {
      const gameLoop = async () => {
        setBetting_round(1);
        while (activePlayersRef.current.filter(person => person === true).length > 1 && betting_roundRef.current < 5) { // 조정 필요. open 버튼 로직에도 개입함
          await drawCards();
          await change_indicator(determineWinner(facemaker(handsRef.current), activePlayersRef.current, true)); 
          console.log(calculateHandRank(facemaker(handsRef.current[0]), false)); // 7D 8D -> 2배 되어도 투페어인데 포카드로 인식하는 문제있음
          await setPlayershouldbetfunc();
          await handleBettingRound();
          setBetting_round(prevBetting_Round => prevBetting_Round + 1);
          betting_roundRef.current = betting_roundRef.current + 1;
        }
        const gameover = async() => {
          setGamestarted(false);
          gamestartedRef.current = false;
          const winner = determineWinner(handsRef.current, activePlayersRef.current, false);
          setWinner_index(winner);
          winner_indexRef.current = winner;
          setMoneys(prevMoneys => {
            const newMoney = [...prevMoneys];
            newMoney[winner] = newMoney[winner] + potRef.current;
            moneysRef.current = newMoney;
            return newMoney;
          })
          setPot(0);
          potRef.current = 0;
        }
        if (activePlayersRef.current.filter(person => person === true).length > 1 && showFifthCardRef.current === false){
          await waitForOpen();
        }
        await gameover();
      };
      gameLoop();
    }
  }, [gamestarted]);

  useEffect(() => {
    if(!is_first_operation && !is_beginning){
      if (indicatorRef.current !== 0 && resolveFunction) {
        resolveFunction();
      }
    } 
  }, [indicator]);

  useEffect(() => {
    if(!is_first_operation && !is_beginning){
      if (showFifthCardRef.current === true && resolveFunction2) {
        resolveFunction2();
      }
    } 
  }, [showFifthCard]);

  const setPlayershouldbetfunc = async() => {
    const duty1 = async() => {
      setPlayershouldbet(prevPlayershouldbet => {
        const newPlayershouldbet = [...prevPlayershouldbet];
        for (let i = 0; i < playerCount; i++){
          if (activePlayersRef.current[i]){
            newPlayershouldbet[i] = true;
          }
        }
        playershouldbetRef.current = newPlayershouldbet;
        return newPlayershouldbet;
      });
    }
    await duty1();
  }

  const nullingresolvefunction = async() => {
    setResolveFunction(null);
  }

  const nullingresolvefunction2 = async() => {
    setResolveFunction2(null);
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

  const waitForOpen = async() => {
    return new Promise(resolve => {
      setResolveFunction2(() => {
        const internal = async() => {
          await nullingresolvefunction2();
          resolve();
        }
        return internal;
      });
    });
  };

  const handleBettingRound = async () => {
    setRaised(0);
    setTurn(true);
    setTurnmoneymanage(new Array(playerCount).fill(0));
    while (playershouldbetRef.current.some(person => person === true) && activePlayersRef.current.filter(person => person === true).length > 1){
      if (indicatorRef.current === 0){
        await waitForPlayerDecision();
      } else {
        const decision = await aiDecision();
        if (decision.decision === 'call') {
          await call(indicatorRef.current);
        } else if (decision.decision === 'fold') {
          await fold(indicatorRef.current);
        } else {
          await raise(indicatorRef.current);
        }
      }
      console.log(playershouldbetRef.current);
    }
    setTurn(false);
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
    setTurnmoneymanage(new Array(playerCount).fill(0));
    setIs_beginning(true);
    setPot(0);
    setIs_first_operation(false);
    await change_indicator(0);
    setRaised(default_ante);
  };

  const fold = async (playerIndex) => {
    console.log("player ", playerIndex, " folded");
    setActivePlayers(prevActivePlayers => {
      const newActivePlayers = [...prevActivePlayers];
      newActivePlayers[playerIndex] = false;
      return newActivePlayers;
    });
    
    const duty = async() => {
      setPlayershouldbet(prevPlayershouldbet => {
        const newPlayershouldbet = [...prevPlayershouldbet];
        newPlayershouldbet[playerIndex] = false;
        playershouldbetRef.current = newPlayershouldbet;
        return newPlayershouldbet;
      });
    }
    await duty();
    await inc_indicator();
  };

  const call = async (playerIndex) => {
    console.log("player ", playerIndex, " called");
    const moneyshouldpaid = raisedRef.current - turnmoneymanageRef.current[playerIndex];
    const newMoney = ( moneysRef.current[playerIndex] - moneyshouldpaid > 0 ? moneysRef.current[playerIndex] - moneyshouldpaid : 0 );
    const moneyPaid = ( moneysRef.current[playerIndex] - moneyshouldpaid > 0 ? moneyshouldpaid : moneysRef.current[playerIndex] );

    setPot(prevPot => prevPot + moneyPaid)

    setMoneys(prevMoneys => {
      const newMoneys = [...prevMoneys];
      newMoneys[playerIndex] = newMoney;
      return newMoneys;
    });

    setTurnmoneymanage(prevTurnmoneymanage => {
      const newTurnmoney = [...prevTurnmoneymanage];
      newTurnmoney[playerIndex] = newTurnmoney[playerIndex] + moneyPaid;
      return newTurnmoney;
    });

    const duty = async() => {
      setPlayershouldbet(prevPlayershouldbet => {
        const newPlayershouldbet = [...prevPlayershouldbet];
        newPlayershouldbet[playerIndex] = false;
        playershouldbetRef.current = newPlayershouldbet;
        return newPlayershouldbet;
      });
    }

    await duty();
    await inc_indicator();
  };

  const inc_indicator = async() => {
    setIndicator(prevIndicator => {
      let newIndicator = prevIndicator + 1;
      let round = 0;
      while (!playershouldbetRef.current[newIndicator]) {
        newIndicator++;
        if (newIndicator > playerCount-1) {
          newIndicator = 0;
          round++;
        }
        if (round > 3){
          return null;
        }
      }
      indicatorRef.current = newIndicator; // 괜찮은 방법. 더 괜찮게 하려면 update 함수 따로 정의해서 indicator, setIndicator, indicatorRef를 묶은 다음 한 번에 정의할 수도.
      return newIndicator;
    });
  }

  const change_indicator = (async(ch) => {
    setIndicator(ch);
  });

  const raise = async(playerIndex) => {
    const betduty = async(i) => {
      await setPlayershouldbetfunc();
      call(i);
    }

    if (moneysRef.current[playerIndex] > potRef.current*1.5) {
      setRaised(potRef.current*1.5);
      raisedRef.current = potRef.current*1.5;
      await betduty(playerIndex);
      console.log("player ", playerIndex, " raised. raised: ", raisedRef.current);
    } else if (moneysRef.current[playerIndex] > raisedRef.current) { //All-in
      setRaised(turnmoneymanageRef.current[playerIndex] + moneysRef.current[playerIndex]);
      raisedRef.current = turnmoneymanageRef.current[playerIndex] + moneysRef.current[playerIndex];
      await betduty(playerIndex);
      console.log("player ", playerIndex, " all-in. raised: ", raisedRef.current);
    } else {
      await call(playerIndex);
      console.log("player ", playerIndex, " called by raise. raised: ", raisedRef.current);
    }
  };

  const drawCards = async() => {
    setCardsDrawn(prevCardsDrawn => {
      return prevCardsDrawn.map((cards, index) => {
        if (activePlayersRef.current[index] && cards < 5) {
          const newHand = handsRef.current[index].concat(shuffledCards[cards + index * 5]);
          setHands(prevHands => {
            const newHands = [...prevHands];
            newHands[index] = newHand;
            handsRef.current = newHands; // Strict Mode로 문제발생, handsRef.current를 최신화하는 다른 방법 떠올려야 *만약 이렇게 안 하면 베팅 보스 설정에서 문제 발생
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
      showFifthCardRef.current = true;
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

        if (i !== 0 && j === 0 && ((showFifthCard && !activePlayersRef.current[i]) || !showFifthCard)) {
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
          Betting Round : {betting_roundRef.current}, Pot: {potRef.current}, winner_index: {winner_indexRef.current}
          <button
            className={`btn btn-sm ${deckShuffled ? 'btn-primary' : 'btn-secondary'} shuffle-button`}
            onClick={shuffleCards}
            disabled={gamestartedRef.current}
          >
            New Game
          </button>
          <button
            className={`btn btn-sm ${cardsDrawn.some(cards => cards === 5) ? 'btn-primary' : 'btn-secondary'} open-button`}
            onClick={handleOpen}
            disabled={betting_roundRef.current < 5 || showFifthCard}
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