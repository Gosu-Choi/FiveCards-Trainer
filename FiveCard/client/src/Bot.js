const ranks = '23456789TJQKA';
const suits = 'CHDS';

// 카드의 순위를 판단하는 함수
function getCardRank(card) {
  return ranks.indexOf(card[0]);
}

// 핸드의 순위를 계산하는 함수
function calculateHandRank(hand, is_face) {
  const sortedHand = hand.sort((a, b) => getCardRank(b) - getCardRank(a)); // 높은 카드가 먼저 오도록 정렬

  const isFlush = sortedHand.every(card => card[1] === sortedHand[0][1]);
  const isStraight = sortedHand.every((card, index) => {
    if (index === 0) return true;
    return getCardRank(card) === getCardRank(sortedHand[index - 1]) - 1;
  });

  const rankCounts = {};
  sortedHand.forEach(card => {
    const rank = card[0];
    rankCounts[rank] = (rankCounts[rank] || 0) + 1;
  });
  
  const counts = Object.values(rankCounts).sort((a, b) => b - a);
  if (is_face === false){ // face가 false인 경우 5장 보기의 승자를 return
    if (isStraight && isFlush) return { rank: 8, highCard: sortedHand, hand: "Straight-Flush!!" }; // 스트레이트 플러시
    if (counts[0] === 4) return { rank: 7, highCard: sortedHand, hand: "Four-Cards!!" }; // 포카드
    if (counts[0] === 3 && counts[1] === 2) return { rank: 6, highCard: sortedHand, hand: "Full-House!" }; // 풀하우스
    if (isFlush) return { rank: 5, highCard: sortedHand, hand: "Flush!" }; // 플러시
    if (isStraight) return { rank: 4, highCard: sortedHand, hand: "Straight!" }; // 스트레이트
    if (counts[0] === 3) return { rank: 3, highCard: sortedHand, hand: "Triple" }; // 트리플
    if (counts[0] === 2 && counts[1] === 2) return { rank: 2, highCard: sortedHand, hand: "Two Pair" }; // 투페어
    if (counts[0] === 2) return { rank: 1, highCard: sortedHand, hand: "One Pair" }; // 원페어
    return { rank: 0, highCard: sortedHand, hand: "Top" }; // 높은 카드
  } else { // face가 true인 경우 액면 승자를 return
    if (counts[0] === 4) return { rank: 7, highCard: sortedHand, hand: "Four-Cards!!" }; // 포카드
    if (counts[0] === 3) return { rank: 3, highCard: sortedHand, hand: "Triple" }; // 트리플
    if (counts[0] === 2 && counts[1] === 2) return { rank: 2, highCard: sortedHand, hand: "Two Pair" }; // 투페어
    if (counts[0] === 2) return { rank: 1, highCard: sortedHand, hand: "One Pair" }; // 원페어
    return { rank: 0, highCard: sortedHand, hand: "Top" }; // 높은 카드
  }   
}

// 두 핸드의 승자를 결정하는 함수
function compareHands(handA, handB, is_face) {
  const rankA = calculateHandRank(handA, is_face);
  const rankB = calculateHandRank(handB, is_face);

  if (rankA.rank > rankB.rank) return 1;
  if (rankA.rank < rankB.rank) return -1;

  // 같은 족보인 경우, 더 높은 카드를 가진 사람이 이김
  for (let i = 0; i < handA.length; i++) {
    const cardA = getCardRank(rankA.highCard[i]);
    const cardB = getCardRank(rankB.highCard[i]);
    if (cardA > cardB) return 1;
    if (cardA < cardB) return -1;
  }

  return 0; // 무승부
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

// 위 코드들을 import로 해결할 수 있다면 좋을듯
// Betting AI should be improved.

const aiDecision = async (indicator, survivor, hands, is_final) => {
  return new Promise((resolve) => {
    setTimeout(() => { 
      const roll = Math.random();
      let decision;
      if (is_final) { 
        const myHands = calculateHandRank(hands[indicator], false); 
        const faceHands = new Array(survivor.length).fill(false);
        for (let i = 0; i<survivor.length; i++){
          faceHands[i] = calculateHandRank(facemaker(hands)[i], true);
        }
        if (faceHands.filter(facehand => facehand !== false).every(facehand => facehand.rank <= myHands.rank)) {
          if (roll > 0.9){
            decision = "raise";
          } else {
            decision = "call";
          }
        } else {
          if (roll > 0.9){
            decision = "raise";
          } else if (roll > 0.7){
            decision = "call";
          } else {
            decision = "fold";
          }
        }
      } else {
        const myHands = calculateHandRank(hands[indicator], true); 
        const faceHands = new Array(survivor.length).fill(false);
        for (let i = 0; i<survivor.length; i++){
          faceHands[i] = calculateHandRank(facemaker(hands)[i], true);
        }
        if (faceHands.filter(facehand => facehand !== false).every(facehand => facehand.rank <= myHands.rank)) {
          if (roll > 0.7){
            decision = "raise";
          } else {
            decision = "call";
          }
        } else {
          if (roll > 0.9){
            decision = "raise";
          } else if (roll > 0.7){
            decision = "call";
          } else {
            decision = "fold";
          }
        }
      }
      resolve({ decision });
    }, 500);
  });
};

 module.exports = { aiDecision };