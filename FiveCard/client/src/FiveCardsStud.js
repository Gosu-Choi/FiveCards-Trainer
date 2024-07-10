import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { shuffle } from './utils'; // 섞기 함수 임포트
import './FiveCardsStud.css'; // 스타일을 위한 CSS 파일 임포트
import 'bootstrap/dist/css/bootstrap.min.css'; // 부트스트랩 CSS 임포트
import { calculateHandRank, determineWinner, facemaker } from './pokerHands';
import { aiDecisionStud, DecisionFBStud } from './Bot';
import marbleImage from './round-poker-table.svg';

function FiveCardsStud() {
 
  const default_player_number = 5;
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
  const [playerchoice, setPlayerchoice] = useState(null);
  const [rightBoxVisible, setRightBoxVisible] = useState(true);
  const [language, setLanguage] = useState("English");

  const { useremail, login, logout, isAuthenticated } = useAuth();

  const playerchoiceRef = useRef(playerchoice);
  const cardsDrawnRef = useRef(cardsDrawn);
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
    cardsDrawnRef.current = cardsDrawn;
  }, [cardsDrawn]);

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

  // const saving_function = async(money) => { // incomplete
  //   const response = await fetch('http://localhost:5000/fivecardsstud', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({ email, money }),
  //   });
  
  //   const data = await response.json();
  //   if (data.success) {
  //     return null;
  //   } else {
  //     alert('Error has occured');
  //   }
  // }

  useEffect(() => {
    if (playerCount) {
      setActivePlayers(new Array(playerCount).fill(true));
      setPlayershouldbet(new Array(playerCount).fill(true));
      setCardsDrawn(new Array(playerCount).fill(0));
      setHands(new Array(playerCount).fill([]));
      setMoneys(new Array(playerCount).fill(100000));
      setTurnmoneymanage(new Array(playerCount).fill(0));
      drawPokerTable();
      setExplanations(Array.from({ length: playerCount }, (_, i) => `해설 ${i + 1}`)); // 해설 개수를 변경할 수 있습니다.
      explanationsRef.current = Array.from({ length: playerCount }, (_, i) => `해설 ${i + 1}`);
    }
  }, [playerCount]);

  useEffect(()=> {
    raisedRef.current = raised;
    console.log("raised has been changed");
    if (!is_first_operation){
      if (is_beginning) {
        console.log("it is beginning");
        const beginning_func = async() => {
          while (playershouldbetRef.current.some(person => person === true)){
            if (moneys[indicatorRef.current] < default_ante){
              await fold(indicatorRef.current);
            } else {
              await call(indicatorRef.current);
            }
          }
          await drawCards();
          setIs_beginning(false);
          setGamestarted(true);
        }
        beginning_func();
      } 
    }
  }, [raised])

  useEffect(() => {
    gamestartedRef.current = gamestarted;
    console.log("game started");
    if (gamestartedRef.current) {
      const gameLoop = async () => {
        console.log("game started again");
        setBetting_round(1);
        betting_roundRef.current = 1;
        while (activePlayersRef.current.filter(person => person === true).length > 1 && betting_roundRef.current < 5) { // 조정 필요. open 버튼 로직에도 개입함
          await drawCards();
          console.log(handsRef.current, facemaker(handsRef.current)); 
          await change_indicator(determineWinner(facemaker(handsRef.current), activePlayersRef.current, true));
          await setPlayershouldbetfunc();
          await handleBettingRound();
          setBetting_round(prevBetting_Round => prevBetting_Round + 1);
          betting_roundRef.current = betting_roundRef.current + 1;
        }
        const gameover = async() => {
          setGamestarted(false);
          gamestartedRef.current = false;
          const winner = determineWinner(handsRef.current, activePlayersRef.current, false);
          console.log(calculateHandRank(handsRef.current[winner], false));
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

  const togglelanguage = () => {
    if(language === "English"){
      setLanguage("Korean");
    } else {
      setLanguage("English");
    }
  }

  const loggingout = () => {
    logout();
    navigate('/login');
  }

  const savemoney = async (email, money) => {
      const response = await fetch('http://localhost:5000/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, money }),
      });
  
      const data = await response.json();
      if (data.success) {
        alert('Success.'); // 회원가입 성공 시 로그인 페이지로 이동
      } else {
        alert(data.message || 'Save failed'); // 서버에서 전송된 오류 메시지 출력
      }
  }

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
        const dec = await DecisionFBStud(0, activePlayersRef.current, handsRef.current, moneysRef.current, potRef.current, handsRef.current.some(hand => hand.length === 5), playerchoiceRef.current, raisedRef.current, language);
        const advice = "You should have done ".concat(dec.decision);
        setExplanations(prevExplanation => {
          const prevE = [...prevExplanation];
          prevE[0] = advice;
          explanationsRef.current = prevE;
          return prevE;
        })
      } else {
        const dec = await aiDecisionStud(indicatorRef.current, activePlayersRef.current, handsRef.current, moneysRef.current, potRef.current, handsRef.current.some(hand => hand.length === 5), raisedRef.current, language);
        const deci = dec.decision.split('.')[0];
        setExplanations(prevExplanation => {
          const prevE = [...prevExplanation];
          prevE[indicatorRef.current] = "Bot ".concat(indicatorRef.current).concat("'s rationale for the decision: ").concat(dec.decision);
          explanationsRef.current = prevE;
          return prevE;
        })
        console.log(dec.decision);
        if (deci === 'Call') {
          await call(indicatorRef.current);
        } else if (deci === 'Fold') {
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
      '2D', '3D', '4D', '5D', '6D', '7D', '8D', '9D', 'TD', 'JD', 'QD', 'KD', 'AD',
      '2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C', 'TC', 'JC', 'QC', 'KC', 'AC',
      '2H', '3H', '4H', '5H', '6H', '7H', '8H', '9H', 'TH', 'JH', 'QH', 'KH', 'AH',
      '2S', '3S', '4S', '5S', '6S', '7S', '8S', '9S', 'TS', 'JS', 'QS', 'KS', 'AS'
    ];

    const shuffled = shuffle(cardFiles); 

    setExplanations(Array.from({ length: playerCount }, (_, i) => `해설 ${i + 1}`));
    setWinner_index(null);
    setShuffledCards(shuffled);
    setDeckShuffled(true);
    setShowFifthCard(false);
    setCardsDrawn(new Array(playerCount).fill(0));
    setHands(new Array(playerCount).fill([]));
    setActivePlayers(new Array(playerCount).fill(true));
    setPlayershouldbet(new Array(playerCount).fill(true));
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

    if (indicatorRef.current === 0){
      setPlayerchoice("fold");
      playerchoiceRef.current = "fold";
    }

    await duty();
    await inc_indicator();
  };

  const call = async (playerIndex) => {
    console.log("player ", playerIndex, " called");
    const moneyshouldpaid = raisedRef.current - turnmoneymanageRef.current[playerIndex];
    const newMoney = ( moneysRef.current[playerIndex] - moneyshouldpaid > 0 ? moneysRef.current[playerIndex] - moneyshouldpaid : 0 );
    const moneyPaid = ( moneysRef.current[playerIndex] - moneyshouldpaid > 0 ? moneyshouldpaid : moneysRef.current[playerIndex] );

    setPot(prevPot => {
      const newPot = prevPot + moneyPaid;
      potRef.current = newPot;
      return prevPot + moneyPaid;
    });
  
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

    if (indicatorRef.current === 0){
      setPlayerchoice("call");
      playerchoiceRef.current = "call";
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
    indicatorRef.current = ch;
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

    if (indicatorRef.current === 0){
      setPlayerchoice("raise");
      playerchoiceRef.current = "raise";
    }
  };

  const drawCards = async() => {
    const prevCardsDrawn = cardsDrawnRef.current;
    const newCardsDrawn = prevCardsDrawn.map((cards, index) => {
      if (activePlayersRef.current[index] && cards < 5) {
        const newHand = handsRef.current[index].concat(shuffledCards[cards + index * 5]); 
        const newHands = [...handsRef.current];
        newHands[index] = newHand;
        setHands(newHands);
        handsRef.current = newHands;
        console.log(handsRef.current);
        return cards + 1;
      }
      return cards;
    });
    setCardsDrawn(newCardsDrawn);
    cardsDrawnRef.current = newCardsDrawn;
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
            className={`btn btn-sm fold-button ${winner_indexRef.current == i ? 'btn-warning' : indicatorRef.current == i ? 'btn-danger' : !activePlayersRef.current[i] ? 'btn-secondary' : 'btn-primary'}`}
            style={{ left: `${x-7}%`, top: `${y - 11}%` }} // 원의 각 지점보다 약간 위에 둠
          >
            Bot {i} : {moneysRef.current[i]}
          </div>
        );
      } else {
        boxes.push(
          <div
            key={`Player-${i}`}
            className={`btn btn-sm fold-button ${winner_indexRef.current == i ? 'btn-warning' : indicatorRef.current == i ? 'btn-danger' : !activePlayersRef.current[i] ? 'btn-secondary' : 'btn-primary'}`}
            style={{ left: `${x-7}%`, top: `${y - 11}%` }} // 원의 각 지점보다 약간 위에 둠
          >
            Player : {moneysRef.current[i]}
          </div>
        );
      }
    }

    return boxes;
  };

  const canvasRef = useRef(null);
  const [explanations, setExplanations] = useState([]);
  const explanationsRef = useRef(explanations);

  const drawPokerTable = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = (Math.min(centerX, centerY) - 20);

    const img = new Image();
    img.src = marbleImage; // 도박 매트 이미지 경로
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // 기존의 도형을 지웁니다.
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 2, 0, Math.PI * 2); // 원의 반지름을 두 배로 설정합니다.
      ctx.clip();
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.restore();
      ctx.stroke();
    };
  };

  return (
  <div className="container">
    <div className={`left-box ${rightBoxVisible ? '' : 'centered'}`}>
    <div className="canvas-container">
      <canvas ref={canvasRef} width="600" height="600"></canvas>
        {renderBoxes()}
        <div className="button-container">
          <div>Pot: {potRef.current}</div>
          Bet {raisedRef.current-turnmoneymanageRef.current[0] <= moneysRef.current[0] ? raisedRef.current-turnmoneymanageRef.current[0] : moneysRef.current[0]} to {raisedRef.current-turnmoneymanageRef.current[0] === 0 ? "check" : "call"},
          Bet {1.5*potRef.current} to raise.
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
        <button onClick={() => savemoney(useremail, moneysRef.current[0])} className={`btn btn-primary`} style={{ position: 'absolute', top: '50px', right: '10px' }}>
        Money Save
        </button>
        <button onClick={loggingout} className={`btn btn-primary`} style={{ position: 'absolute', top: '10px', right: '10px' }}>
        Log Out
        </button>
        <button onClick={() => savemoney(useremail, 100000)} className={`btn btn-primary`} style={{ position: 'absolute', top: '90px', right: '10px' }}>
        Money Reset
        </button>
      </div>
      {rightBoxVisible && (
        <div className="right-box" style={{ gridTemplateRows: `repeat(${explanations.length}, 1fr)` }}>
          {explanations.map((explanation, index) => (
            <div key={index} className={`${activePlayersRef.current[index] ? 'explanation-cell' : 'explanation-cell-folded'}`}>
              {explanation}
            </div>
          ))}
        </div>
      )}
      <button onClick={() => setRightBoxVisible(!rightBoxVisible)} className={`btn ${rightBoxVisible ? 'btn-secondary' : 'btn-primary'}`} style={{ position: 'absolute', top: '10px', left: '10px' }}>
        Trainer {rightBoxVisible ? 'Off' : 'On'}
      </button>
      <button onClick={() => togglelanguage()} className={`btn btn-primary`} style={{ position: 'absolute', top: '50px', left: '10px' }}>
        {language === "English" ? '한국어로 변경' : 'In English'}
      </button>
    </div>
  );
}

export default FiveCardsStud;