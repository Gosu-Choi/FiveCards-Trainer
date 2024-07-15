// const ranks = '23456789TJQKA';
// const suits = 'CHDS';

// // 카드의 순위를 판단하는 함수
// function getCardRank(card) {
//   return ( ranks.indexOf(card[0]) + (suits.indexOf(card[1])/10) );
// }

// function getCardNumber(card){
//   return ranks.indexOf(card[0]);
// }

// // 핸드의 순위를 계산하는 함수. 수, 무늬도 보게끔 해야 함. ranks.indexOf(Main_card) + suits.indexOf(Main_card)/10
// function calculateHandRank(hand, is_face) {
//   const sortedHand = [...hand].sort((a, b) => getCardRank(b) - getCardRank(a)); // 높은 카드가 먼저 오도록 정렬

//   const isFlush = (sortedHand.every(card => card[1] === sortedHand[0][1]) && sortedHand.length === 5);
//   const isStraight = (sortedHand.every((card, index) => {
//     if (index === 0) return true;
//     return getCardNumber(card) === getCardNumber(sortedHand[index - 1]) - 1;
//   }) && sortedHand.length === 5);

//   const rankCounts = {};
//   sortedHand.forEach(card => {
//     const rank = card[0];
//     rankCounts[rank] = (rankCounts[rank] || 0) + 1;
//   });
  
//   let pair_mainee = null;
//   let pair_mainee_index = null;
//   for (let i = 0; i < ranks.length; i++){
//     if(rankCounts[ranks[i]] !== false){
//       if(pair_mainee <= rankCounts[ranks[i]]){
//         pair_mainee = rankCounts[ranks[i]];
//         pair_mainee_index = ranks[i];
//       }
//     } 
//   }
  
//   const pair_main = sortedHand.filter(card => card[0] === pair_mainee_index).sort((a, b) => getCardRank(b) - getCardRank(a))[0];
  
//   const counts = Object.values(rankCounts).sort((a, b) => b - a);
//   if (is_face === false){ // face가 false인 경우 5장 보기의 승자를 return
//     if (isStraight && isFlush) return { rank: 8, mainCard: sortedHand[0], highCard: sortedHand, hand: "Straight-Flush" }; // 스트레이트 플러시
//     if (counts[0] === 4) return { rank: 7, mainCard: pair_main, highCard: sortedHand, hand: "Four-Cards" }; // 포카드
//     if (counts[0] === 3 && counts[1] === 2) return { rank: 6, mainCard: pair_main, highCard: sortedHand, hand: "Full-House" }; // 풀하우스
//     if (isFlush) return { rank: 5, mainCard: sortedHand[0], highCard: sortedHand, hand: "Flush" }; // 플러시
//     if (isStraight) return { rank: 4, mainCard: sortedHand[0], highCard: sortedHand, hand: "Straight" }; // 스트레이트
//     if (counts[0] === 3) return { rank: 3, mainCard: pair_main, highCard: sortedHand, hand: "Triple" }; // 트리플
//     if (counts[0] === 2 && counts[1] === 2) return { rank: 2, mainCard: pair_main, highCard: sortedHand, hand: "Two Pair" }; // 투페어
//     if (counts[0] === 2) return { rank: 1, mainCard: pair_main, highCard: sortedHand, hand: "One Pair" }; // 원페어
//     return { rank: 0, mainCard: sortedHand[0], highCard: sortedHand, hand: "Top" }; // 높은 카드
//   } else { // face가 true인 경우 액면 승자를 return
//     if (counts[0] === 4) return { rank: 7, mainCard: pair_main, highCard: sortedHand, hand: "Four-Cards" }; // 포카드
//     if (counts[0] === 3) return { rank: 3, mainCard: pair_main, highCard: sortedHand, hand: "Triple" }; // 트리플
//     if (counts[0] === 2 && counts[1] === 2) return { rank: 2, mainCard: pair_main, highCard: sortedHand, hand: "Two Pair" }; // 투페어
//     if (counts[0] === 2) return { rank: 1, mainCard: pair_main, highCard: sortedHand, hand: "One Pair" }; // 원페어
//     return { rank: 0, mainCard: sortedHand[0], highCard: sortedHand, hand: "Top" }; // 높은 카드
//   }   
// }

const handRanks = {
  'HighCard': 1,
  'OnePair': 2,
  'TwoPair': 3,
  'ThreeOfAKind': 4,
  'Straight': 5,
  'Flush': 6,
  'FullHouse': 7,
  'FourOfAKind': 8,
  'StraightFlush': 9,
};

const ranks = '23456789TJQKA';
const suits = 'CDHS';

const getCardRank = (card) => {
  return ( ranks.indexOf(card[0]) );
}

const getCardSuits = (card) => {
  return ( suits.indexOf(card[1]) );
}

const cardValue = (card) => {
  const value = card.slice(0, -1);
  if (value === 'A') return 14;
  if (value === 'K') return 13;
  if (value === 'Q') return 12;
  if (value === 'J') return 11;
  if (value === 'T') return 10;
  return parseInt(value, 10);
};

const evaluateHand = (hand, is_face) => {
  const sortedHand = [...hand].sort((a, b) => getCardRank(b) - getCardRank(a));
  const values = hand.map(card => cardValue(card)).sort((a, b) => b - a);
  const suits = hand.map(card => card.slice(-1));
  const valueCounts = [...values].reduce((acc, value) => {
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});

  const isFlush = (suits.every(suit => suit === suits[0]) && suits.length === 5);
  const isStraight = (values.every((card, index) => {
    if (index === 0) return true;
    return card === values[index - 1] - 1;
  }) && values.length === 5);

  const counts = Object.values(valueCounts).sort((a, b) => b - a);
  const uniqueValues = Object.keys(valueCounts).sort((a, b) => valueCounts[b] - valueCounts[a] || b - a).map(Number);
  if (!is_face){
    if (isFlush && isStraight) {
      return { rank: 'StraightFlush', main: getCardSuits(sortedHand[0]), values };
    } else if (counts[0] === 4) {
      return { rank: 'FourOfAKind', main: getCardSuits(sortedHand[0]), values: uniqueValues };
    } else if (counts[0] === 3 && counts[1] === 2) {
      return { rank: 'FullHouse', main: getCardSuits(sortedHand[0]), values: uniqueValues };
    } else if (isFlush) {
      return { rank: 'Flush', main: getCardSuits(sortedHand[0]), values };
    } else if (isStraight) {
      return {rank: 'Straight', main: getCardSuits(sortedHand[0]), values };
    } else if (counts[0] === 3) {
      return { rank: 'ThreeOfAKind', main: getCardSuits(sortedHand[0]), values: uniqueValues };
    } else if (counts[0] === 2 && counts[1] === 2) {
      return { rank: 'TwoPair', main: getCardSuits(sortedHand[0]), values: uniqueValues };
    } else if (counts[0] === 2) {
      return { rank: 'OnePair', main: getCardSuits(sortedHand[0]), values: uniqueValues };
    } else {
      return { rank: 'HighCard', main: getCardSuits(sortedHand[0]), values };
    }
  } else {
    if (counts[0] === 4) {
      return { rank: 'FourOfAKind', main: getCardSuits(sortedHand[0]), values: uniqueValues };
    } else if (counts[0] === 3) {
      return { rank: 'ThreeOfAKind', main: getCardSuits(sortedHand[0]), values: uniqueValues };
    } else if (counts[0] === 2 && counts[1] === 2) {
      return { rank: 'TwoPair', main: getCardSuits(sortedHand[0]), values: uniqueValues };
    } else if (counts[0] === 2) {
      return { rank: 'OnePair', main: getCardSuits(sortedHand[0]), values: uniqueValues };
    } else {
      return { rank: 'HighCard', main: getCardSuits(sortedHand[0]), values };
    }
  }
};

// 두 핸드의 승자를 결정하는 함수
function compareHands(handA, handB, is_face) {
  const evalA = evaluateHand(handA, is_face);
  const evalB = evaluateHand(handB, is_face);

  if (handRanks[evalA.rank] > handRanks[evalB.rank]) {
    return 1;
  } else if (handRanks[evalA.rank] < handRanks[evalB.rank]) {
    return -1;
  } else {
    for (let i = 0; i < evalA.values.length; i++) {
      if (evalA.values[i] !== evalB.values[i]) {
        return evalA.values[i] > evalB.values[i] ? 1 : -1;
      }
    }
    return evalA.main > evalB.main ? 1 : -1; // 모든 카드가 같을 경우 스하다클 문양 순
  }
}

function facemaker(hands) {
  let face = new Array(hands.length).fill([]);
  for (let i=0; i<hands.length; i++){
    for (let j=1; j<hands[i].length; j++){
      face[i] = face[i].concat(hands[i][j]);
    }
  }
  return face;
}

const combinations = (arr, k) => {
  const results = [];
  const combination = (start, path) => {
    if (path.length === k) {
      results.push(path);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      combination(i + 1, [...path, arr[i]]);
    }
  };
  combination(0, []);
  return results;
};

const handDecision = (hands) => {
  const bestHands = [];

  hands.forEach(hand => {
    const allCombinations = combinations(hand, 5);
    let bestHand = allCombinations[0];

    allCombinations.forEach(combination => {
      if (compareHands(combination, bestHand) > 0) {
        bestHand = combination;
      }
    });

    bestHands.push(bestHand);
  });
  console.log(bestHands);
  return bestHands;
};
// 승자를 판단하는 함수
function determineWinner(hands, activity, is_face) {
  let bestHandIndex;
  for (let i = 0; i < hands.length; i++) {
    if (!activity[i]){
      continue;
    }
    bestHandIndex = i;
    break;
  }

  for (let i = 0; i < hands.length; i++) {
    if (!activity[i]){
      continue;
    }
    if (compareHands(hands[i], hands[bestHandIndex], is_face) > 0) {
      bestHandIndex = i;
    }
  }
  return bestHandIndex;
  // const winners = [];
  // for (let i = 0; i < hands.length; i++) {
  //   if (compareHands(hands[i], hands[bestHandIndex], is_face) === 0) {
  //     winners.push(i);
  //   }
  // }
  // return winners;
}

function determineWinner7(hands, activity){
  if (hands.some(hand => hand.length > 5)){
    return determineWinner(handDecision(hands), activity);
  } else {
    return determineWinner(hands, activity);
  }
}

module.exports = { evaluateHand, determineWinner, determineWinner7, facemaker };
