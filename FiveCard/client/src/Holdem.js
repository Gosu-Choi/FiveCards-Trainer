import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { shuffle } from './utils'; // 섞기 함수 임포트
import './Holdem.css'; // 스타일을 위한 CSS 파일 임포트
import 'bootstrap/dist/css/bootstrap.min.css'; // 부트스트랩 CSS 임포트
import { evaluateHand, determineWinner7, facemaker } from './pokerHands';
import { aiDecisionHoldem, DecisionFBHoldem, aifeedbackforOM } from './Bot';
import marbleImage from './round-poker-table.svg';
import ChatBot from './Chatbot';
import { useHistory } from './historymaker';

function Holdem() {
  const default_player_number = 5;
  const location = useLocation();
  const navigate = useNavigate();
  const [playerCount, setPlayerCount] = useState(default_player_number);
  const [shuffledCards, setShuffledCards] = useState([]);
  const [activePlayers, setActivePlayers] = useState([]);
  const [playershouldbet, setPlayershouldbet] = useState([]);
  const [turnmoneymanage, setTurnmoneymanage] = useState([]);
  const [cardsDrawn, setCardsDrawn] = useState([]);
  const [communityDrawn, setCommunityDrawn] = useState([]);
  const [showFifthCard, setShowFifthCard] = useState(false);
  const [deckShuffled, setDeckShuffled] = useState(false);
  const [hands, setHands] = useState([]);
  const [community, setCommunity] = useState([]);
  const [pot, setPot] = useState(0); 
  const [raised, setRaised] = useState(null);
  const [indicator, setIndicator] = useState(null);
  const [moneys, setMoneys] = useState([]);
  const SmallBlind = 100;
  const [is_first_operation, setIs_first_operation] = useState(true);
  const [is_beginning, setIs_beginning] = useState(false);
  const [gamestarted, setGamestarted] = useState(false);
  const [resolveFunction, setResolveFunction] = useState(null);
  const [resolveFunction2, setResolveFunction2] = useState(null);
  const [turn, setTurn] = useState(false);
  const [betting_round, setBetting_round] = useState(1);
  const [winner_index, setWinner_index] = useState(null);
  const [playerchoice, setPlayerchoice] = useState([]);
  const [rightBoxVisible, setRightBoxVisible] = useState(true);
  const [language, setLanguage] = useState("Korean");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalIndex, setModalIndex] = useState(null);
  const [ments, setMents] =useState([]);
  const [opponentmodels, setOpponentmodels] = useState([]);
  const [feedbackforOM, setFeedbackforOM] = useState("After game over, feedback for opponent modeling will be shown here.");
  const { historization, historyexport, historyRef } = useHistory();
  const [pokerstyle, setPokerstyle] = useState([]);
  const [raiseAmount, setRaiseAmount] = useState("");
  const [SB_indicator, setDealer_indicator] = useState(0);

  const { useremail, login, logout, isAuthenticated, playerMoney, refreshmoney } = useAuth();
  const playerchoiceRef = useRef(playerchoice);
  const SB_indicatorRef = useRef(SB_indicator);
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
  const communityDrawnRef = useRef(communityDrawn);
  const communityRef = useRef(community);
  const mentsRef = useRef(ments);
  const opponentmodelsRef = useRef(opponentmodels);
  const raiseAmountRef = useRef(raiseAmount);

  useEffect(() => {
    opponentmodelsRef.current = opponentmodels
  }, [opponentmodels])

  useEffect(() => {
    SB_indicatorRef.current = SB_indicator
  }, [SB_indicator])

  useEffect(() => {
    mentsRef.current = ments;
  }, [ments]);

  useEffect(() => {
    communityRef.current = community;
  }, [community]);

  useEffect(() => {
    playerchoiceRef.current = playerchoice;
  }, [playerchoice]);

  useEffect(() => {
    cardsDrawnRef.current = cardsDrawn;
  }, [cardsDrawn]);

  useEffect(() => {
    communityDrawnRef.current = communityDrawn;
  }, [communityDrawn]);

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
      setOpponentmodels(new Array(playerCount-1).fill(''));
      const pokerStyles = ["tight-aggressive", "loose-aggressive", "tight-passive", "loose-passive"];
      setPokerstyle(Array.from({ length: playerCount - 1 }, () => {
        return pokerStyles[Math.floor(Math.random() * 4)];
      }));
      setMents(new Array(playerCount).fill('Player Ments'));
      setActivePlayers(new Array(playerCount).fill(true));
      setPlayershouldbet(new Array(playerCount).fill(true));
      setCardsDrawn(new Array(playerCount).fill(0));
      setCardsDrawn(new Array(1).fill(0));
      setHands(new Array(playerCount).fill([]));
      setCommunity(new Array(1).fill([]))
      setMoneys(new Array(playerCount).fill(100000));
      moneysRef.current = (new Array(playerCount).fill(100000));
      setPlayerchoice(new Array(playerCount).fill([]));
      setMoneys(prevMoneys => {
        const newMoney = [...prevMoneys];
        newMoney[0] = parseInt(playerMoney, 10);;
        moneysRef.current = newMoney;
        return newMoney;
      });
      setTurnmoneymanage(new Array(playerCount).fill(0));
      drawPokerTable();
      setExplanations(Array.from({ length: playerCount }, (_, i) => `해설 ${i + 1}`));
      explanationsRef.current = Array.from({ length: playerCount }, (_, i) => `해설 ${i + 1}`);
    }
    console.log(pokerstyle)
  }, [playerCount]);

  useEffect(()=> {
    if (!is_first_operation){
      if (is_beginning) {
        const beginning_func = async() => {
          // while (playershouldbetRef.current.some(person => person === true)){
          //   if (moneys[indicatorRef.current] < SmallBlind){
          //     await fold(indicatorRef.current);
          //   } else {
          //     await call(indicatorRef.current, true);
          //   }
          // }
          await drawCards();
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
    if (gamestartedRef.current) {
      const gameLoop = async () => {
        while (moneys[SB_indicatorRef.current] < SmallBlind){
          SB_indicatorRef.current = (SB_indicatorRef.current + 1) % playerCount;
        }
        indicatorRef.current = SB_indicatorRef.current;
        setBetting_round(1);
        betting_roundRef.current = 1;
        // Pre-flop
        await change_indicator_betting(SB_indicatorRef.current);
        await setPlayershouldbetfunc();
        await handleBettingRound(false);
        await call(indicatorRef.current, true); // SB
        await raise(indicatorRef.current, 2*SmallBlind); // BB
        setBetting_round(prevBetting_Round => prevBetting_Round + 1);
        betting_roundRef.current = betting_roundRef.current + 1;
        // Flop
        while (activePlayersRef.current.filter(person => person === true).length > 1 && betting_roundRef.current < 3) {
          await drawCommunity();
          await drawCommunity();
          await drawCommunity();
          await change_indicator_betting(SB_indicatorRef.current);
          await setPlayershouldbetfunc();
          await handleBettingRound();
          setBetting_round(prevBetting_Round => prevBetting_Round + 1);
          betting_roundRef.current = betting_roundRef.current + 1;
        }
        // Until River
        while (activePlayersRef.current.filter(person => person === true).length > 1 && betting_roundRef.current < 5) {
          await drawCommunity();
          await change_indicator_betting(SB_indicatorRef.current);
          await setPlayershouldbetfunc();
          await handleBettingRound();
          setBetting_round(prevBetting_Round => prevBetting_Round + 1);
          betting_roundRef.current = betting_roundRef.current + 1;
        }
        const gameover = async() => {
          setGamestarted(false);
          gamestartedRef.current = false;
          const winner = determineWinner7(combinatehand(handsRef.current, communityRef.current), activePlayersRef.current, false);
          setWinner_index(winner);
          winner_indexRef.current = winner;
          let temp = [...moneysRef.current]; // changed from here
          moneysRef.current[winner] = temp[winner] + potRef.current;
          potRef.current = 0; // to here
          historization({betting_result: playerchoiceRef.current, community_cards: communityRef.current[0], final_players: activePlayersRef.current, player_hands: handsRef.current});
          if (!opponentmodelsRef.current.every(e => e===null)) {
            const newfeedbackforOM = await aifeedbackforOM(historyexport(5), opponentmodelsRef.current, playerCount, language, pokerstyle);
            setFeedbackforOM(newfeedbackforOM.feedback);
          }
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
    const response = await fetch('/api/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, money }),
    });
    
    const data = await response.json();
    if (data.success) {
      refreshmoney(money);
      alert('Success.');
    } else {
      alert(data.message || 'Save failed');
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

  const handleBettingRound = async (sign=true) => {
    if(sign){
      setRaised(0);
      raisedRef.current = 0
    } else {
      setRaised(SmallBlind);
      raisedRef.current = SmallBlind
    }
    setTurn(true);
    setTurnmoneymanage(new Array(playerCount).fill(0));
    while (playershouldbetRef.current.some(person => person === true) && activePlayersRef.current.filter(person => person === true).length > 1){
      if (indicatorRef.current === 0){
        await waitForPlayerDecision();
        const dec = await DecisionFBHoldem(0, activePlayersRef.current, handsRef.current, moneysRef.current, potRef.current, (communityRef.current[0].length === 5), playerchoiceRef.current, raisedRef.current, communityRef.current[0], playerchoiceRef.current, language, turnmoneymanageRef.current);
        console.log(JSON.stringify(dec))
        const advice = `You should have done ${dec.decision.action}${dec.decision.amount === 0 ? '' : ` ${dec.decision.amount}`}. ${dec.decision.explanation}`
        setMents(prevMents => {
          const newMents = [...prevMents]
          newMents[indicatorRef.current] = dec.mention;
          mentsRef.current = newMents;
          return newMents;
        })
        setExplanations(prevExplanation => {
          const prevE = [...prevExplanation];
          prevE[0] = advice;
          explanationsRef.current = prevE;
          return prevE;
        })
      } else {
        const dec = await aiDecisionHoldem(indicatorRef.current, activePlayersRef.current, handsRef.current, moneysRef.current, potRef.current, (communityRef.current[0].length === 5), raisedRef.current, communityRef.current[0], playerchoiceRef.current, language, pokerstyle[indicatorRef.current-1], turnmoneymanageRef.current);
        console.log(JSON.stringify(dec))
        setMents(prevMents => {
          const newMents = [...prevMents]
          newMents[indicatorRef.current] = dec.mention;
          mentsRef.current = newMents;
          return newMents;
        })
        const deci = dec.decision.action;
        setExplanations(prevExplanation => {
          const prevE = [...prevExplanation];
          prevE[indicatorRef.current] = `Bot ${indicatorRef.current}'s rationale for the decision: ${dec.decision.action}${dec.decision.amount === 0 ? '' : ` ${dec.decision.amount}`}. ${dec.decision.explanation}`
          explanationsRef.current = prevE;
          return prevE;
        })
        if (deci === 'Raise') {
          await raise(indicatorRef.current, dec.decision.amount);
        } else if (deci === 'Fold') {
          await fold(indicatorRef.current);
        } else {
          await call(indicatorRef.current);;
        }
      }
    }
    setPlayerchoice(prevPlayerChoice => {
      return prevPlayerChoice.map((choice, index) => {
        return [...choice, betting_roundRef.current];
      });
    });
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
    setCommunityDrawn(new Array(1).fill(0));
    setPlayerchoice(new Array(playerCount).fill([]));
    setHands(new Array(playerCount).fill([]));
    setCommunity(new Array(1).fill([]));
    setActivePlayers(new Array(playerCount).fill(true));
    setPlayershouldbet(new Array(playerCount).fill(true));
    setTurnmoneymanage(new Array(playerCount).fill(0));
    setIs_beginning(true);
    potRef.current = 0
    setIs_first_operation(false);
    await change_indicator(0);
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
        playershouldbetRef.current = newPlayershouldbet;
        return newPlayershouldbet;
      });
    }

    setPlayerchoice(prevPlayerChoice => {
      return prevPlayerChoice.map((choice, index) => {
        if (index === playerIndex) {
          return [...choice, 'fold'];
        }
        return choice;
      });
    });

    playerchoiceRef.current = playerchoiceRef.current.map((choice, index) => {
      if (index === playerIndex) {
        return [...choice, 'fold'];
      }
      return choice;
    });
   
    
    await duty();
    await inc_indicator();
  };

  const call = async (playerIndex, is_from_raise=false) => {
    const moneyshouldpaid = raisedRef.current - turnmoneymanageRef.current[playerIndex];
    const newMoney = ( moneysRef.current[playerIndex] - moneyshouldpaid > 0 ? moneysRef.current[playerIndex] - moneyshouldpaid : 0 );
    const moneyPaid = ( moneysRef.current[playerIndex] - moneyshouldpaid > 0 ? moneyshouldpaid : moneysRef.current[playerIndex] );
    
    potRef.current = potRef.current + moneyPaid;

    moneysRef.current[playerIndex] = newMoney;

    turnmoneymanageRef.current[playerIndex] = turnmoneymanageRef.current[playerIndex] + moneyPaid;

    const duty = async() => {
      setPlayershouldbet(prevPlayershouldbet => {
        const newPlayershouldbet = [...prevPlayershouldbet];
        newPlayershouldbet[playerIndex] = false;
        playershouldbetRef.current = newPlayershouldbet;
        return newPlayershouldbet;
      });
    }

    if (!is_from_raise) {
      setPlayerchoice(prevPlayerChoice => {
        return prevPlayerChoice.map((choice, index) => {
          if (index === playerIndex) {
            return [...choice, 'call'];
          }
          return choice;
        });
      });

      playerchoiceRef.current = playerchoiceRef.current.map((choice, index) => {
        if (index === playerIndex) {
          return [...choice, 'call'];
        }
        return choice;
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
    indicatorRef.current = ch;
  });

  const change_indicator_betting = async(k) => {
    for (let i = k; i<playerCount; i++){
      if(activePlayersRef.current[i%playerCount]){
        setIndicator(i%playerCount);
        indicatorRef.current = i%playerCount;
        break;
      }
    }
  }

  const raise = async (playerIndex, raiseTo) => {
    const betDuty = async (i) => {
      await setPlayershouldbetfunc();
      await call(i, true);
    };
  
    const playerMoney = moneysRef.current[playerIndex];
    let newRaised = raisedRef.current; 
  
    if (playerMoney > raiseTo) {
      newRaised = raisedRef.current + raiseTo; // newRaised = playerIndex === 0 ? raiseTo : raisedRef.current + raiseTo;
      setRaised(newRaised);
      raisedRef.current = newRaised;
      await betDuty(playerIndex);
    } else if (playerMoney > raisedRef.current) { 
      newRaised = turnmoneymanageRef.current[playerIndex] + playerMoney; // ?
      setRaised(newRaised);
      raisedRef.current = newRaised;
      await betDuty(playerIndex);
    } else {
      await call(playerIndex);
    }
  
    setPlayerchoice(prevPlayerChoice =>
      prevPlayerChoice.map((choice, index) =>
        index === playerIndex ? [...choice, 'raise'] : choice
      )
    );
  
    playerchoiceRef.current = playerchoiceRef.current.map((choice, index) =>
      index === playerIndex ? [...choice, 'raise'] : choice
    );
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
        return cards + 1;
      }
      return cards;
    });
    setCardsDrawn(newCardsDrawn);
    cardsDrawnRef.current = newCardsDrawn;
  };

  const drawCommunity = async() => {
    const prevCommunityDrawn = communityDrawnRef.current;
    const newCommunityDrawn = prevCommunityDrawn.map((cards, index) => {
      if (activePlayersRef.current.filter(person => person === true).length > 1 && cards < 5) {
        const newCommunity = communityRef.current[index].concat(shuffledCards[52-cards-1]); 
        const newCommunities = [...communityRef.current];
        newCommunities[index] = newCommunity;
        setCommunity(newCommunities);
        communityRef.current = newCommunities;
        return cards + 1;
      }
      return cards;
    });
    setCommunityDrawn(newCommunityDrawn);
    communityDrawnRef.current = newCommunityDrawn;
  };

  const handleOpen = () => {
    const allCommunityDrawn = communityDrawn.some(cards => cards === 5);
    if (allCommunityDrawn) {
      setShowFifthCard(true);
      showFifthCardRef.current = true;
    }
    setRaised(0);
    raisedRef.current = 0
    setGamestarted(false);
  };

  const combinatehand = (hands, communities) => {
    if(communities){
      let finalhands = new Array(hands.length).fill([]);
      for (let i=0; i<hands.length; i++) finalhands[i] = hands[i].concat(communities[0]);
      return finalhands;
    } else {
      return hands;
    }
  }

  const openModal = (content, index) => {
    setModalContent(content);
    setIsModalOpen(true);
    setModalIndex(index);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent('');
    setModalIndex(null);
  };

  const handleOpponentModelChange = (index, value) => {
    const newOpponentmodels = [...opponentmodels];
    newOpponentmodels[index] = value;
    setOpponentmodels(newOpponentmodels);
  };

  const renderBoxes = () => {
    if (playerCount === null) return null;

    const boxes = [];
    const angleIncrement = 180 / (playerCount-1);

    const communityCardY = 10; 

    for (let k = 0; k < communityDrawn[0]; k++) {
        const communityCardX = 50 + 10 * (k - 2);
        let cardFilePath = `/cards/${shuffledCards[52-k-1]}.svg`;

        boxes.push(
            <div
                key={`community-${k}`}
                className="box"
                style={{ left: `${communityCardX}%`, top: `${communityCardY}%` }}
            >
                <div className="card-slot">
                    <img src={cardFilePath} alt={`Community Card ${k}`} className="card-image" />
                </div>
            </div>
        );
    }


    for (let i = 0; i < playerCount; i++) {
      const angle = angleIncrement * i + 180;
      const x = 50 + 40 * Math.cos(Math.PI + (angle) * (Math.PI / 180)); 
      const y = 50 + 40 * Math.sin(Math.PI + (angle) * (Math.PI / 180)); 

      for (let j = 0; j < cardsDrawn[i]; j++) {
        const boxX = x + 5 * j - 2; 
        let cardFilePath = `/cards/${shuffledCards[j + i * 5]}.svg`; 

        if (i !== 0 && ((showFifthCard && !activePlayersRef.current[i]) || !showFifthCard)) {
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
            className={`btn btn-sm fold-button ${winner_indexRef.current === i ? 'btn-warning' : indicatorRef.current === i ? 'btn-danger' : !activePlayersRef.current[i] ? 'btn-secondary' : 'btn-primary'}`}
            style={{ left: `${x-8}%`, top: `${y - 11}%` }} // 원의 각 지점보다 약간 위에 둠
          >
            Bot {i} : {Math.floor(moneysRef.current[i])}
          </div>
        );
      } else {
        boxes.push(
          <div
            key={`Player-${i}`}
            className={`btn btn-sm fold-button ${winner_indexRef.current === i ? 'btn-warning' : indicatorRef.current === i ? 'btn-danger' : !activePlayersRef.current[i] ? 'btn-secondary' : 'btn-primary'}`}
            style={{ left: `${x-8}%`, top: `${y - 11}%` }} // 원의 각 지점보다 약간 위에 둠
          >
            Player : {Math.floor(moneysRef.current[i])}
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
    img.src = marbleImage;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.restore();
      ctx.stroke();
    };
  };

  return (
  <div className="container">
    {isModalOpen && (
      <div className="modal" style={{ display: 'flex' }}>
        <div className="modal-content">
          <ChatBot closeModal={closeModal} chatContext={modalContent} modalIndex={modalIndex} ments={ments} language={language}/>
        </div>
      </div>
    )}
    <div className={`left-box ${rightBoxVisible ? '' : 'centered'}`}>
    <div className="canvas-container">
      <canvas ref={canvasRef} width="600" height="600"></canvas>
        {renderBoxes()}
        <div className="button-container">
          <div>Pot: {potRef.current}</div>
          <div>Bet {raisedRef.current-turnmoneymanageRef.current[0] <= moneysRef.current[0] ? raisedRef.current-turnmoneymanageRef.current[0] : moneysRef.current[0]} to {raisedRef.current-turnmoneymanageRef.current[0] === 0 ? "check" : "call"}</div>
          Call and +{(raisedRef.current === 0 ? potRef.current * 0.1 : raisedRef.current)} to raise.
          <button
            className={`btn btn-sm ${deckShuffled ? 'btn-primary' : 'btn-secondary'} shuffle-button`}
            onClick={shuffleCards}
            disabled={gamestartedRef.current}
          >
            New Game
          </button>
          <button
            className={`btn btn-sm ${communityDrawnRef.current.some(cards => cards === 5) ? 'btn-primary' : 'btn-secondary'} open-button`}
            onClick={handleOpen}
            disabled={betting_roundRef.current < 5 || showFifthCard}
          >
            Showdown
          </button>
          <div className="raise-input-container">
            <input
            id="raiseAmount"
            type="number"
            className="raise-input"
            value={raiseAmountRef.current}
            onChange={(e) => {
                setRaiseAmount(parseInt(e.target.value));
                raiseAmountRef.current = parseInt(e.target.value);
            }}
            placeholder={`Additional Bet Amount`}
            style={{ fontSize: "12px", width: "200px", padding: "0 10px"  }}
            />
          </div>
          <div className="action-buttons">
            <button
              className="btn btn-sm btn-warning action-button"
              onClick={() => call(0)}
              disabled={indicatorRef.current !== 0}
            >
              Call
            </button>
            <button
              className="btn btn-sm btn-danger action-button"
              onClick = {async() => {
                  await raise(0, raiseAmountRef.current);
                  setRaiseAmount(0);
                  raiseAmountRef.current = 0;
                }
              }
              disabled={indicatorRef.current !== 0 ||
              raiseAmountRef.current < (raisedRef.current === 0 ? potRef.current * 0.1 : raisedRef.current)}
            >
              Raise
            </button>
            <button
              className="btn btn-sm btn-secondary action-button"
              onClick={() => fold(0)} 
              disabled={indicatorRef.current !== 0}
            >
              Fold
            </button>
          </div>
        </div>
        </div>
        <button onClick={() => savemoney(useremail, moneysRef.current[0])} className={`btn btn-primary`} style={{ position: 'absolute', bottom: '10px', left: '10px' }}>
        Money Save
        </button>
        <button onClick={loggingout} className={`btn btn-primary`} style={{ position: 'absolute', bottom: '50px', left: '10px' }}>
        Log Out
        </button>
        <button onClick={() => savemoney(useremail, 100000)} className={`btn btn-primary`} style={{ position: 'absolute', bottom: '90px', left: '10px' }}>
        Money Reset
        </button>
      </div>
      {rightBoxVisible && (
          <div className="right-box" style={{ gridTemplateRows: `repeat(${explanations.length}, 1fr)` }}>
            {explanations.map((explanation, index) => (
            <div key={index} className="explanation-wrapper">
              <div className={`${activePlayersRef.current[index] ? 'explanation-cell' : 'explanation-cell-folded'}`}>
                {explanation}
              </div>
              <button class="btn btn-outline-dark info-button" style={{ fontSize: 'x-small' }} onClick={() => openModal(explanation, index)}>Talk to Player {index}</button>
            </div>
            ))}
          </div>
      )}
      {!rightBoxVisible && (
          <div className="right-box" style={{ gridTemplateRows: `repeat(${opponentmodels.length+1}, 1fr)` }}>
            <div key={-1} className="explanation-wrapper">
              <div className={'explanation-cell'}>
                {feedbackforOM}
              </div>
            </div>
            {opponentmodels.map((input, index) => (
              <div key={index} className="explanation-wrapper">
                <textarea
                  className={'explanation-cell'}
                  value={input}
                  onChange={(e) => handleOpponentModelChange(index, e.target.value)}
                  placeholder={`Bot ${index + 1}에 대한 묘사 입력`}
                />
              </div>
            ))}
          </div>
      )}
      <button onClick={() => setRightBoxVisible(!rightBoxVisible)} className={'btn btn-primary'} style={{ position: 'absolute', top: '10px', left: '10px' }}>
        {!rightBoxVisible ? 'To Bot Explanation Mode' : 'To Bot Description Mode'}
      </button>
      <button onClick={() => togglelanguage()} className={`btn btn-primary`} style={{ position: 'absolute', top: '50px', left: '10px' }}>
        {language === "English" ? '한국어로 변경' : 'In English'}
      </button>
    </div>
  );
}

export default Holdem;