const ranks = '23456789TJQKA';
const suits = 'CHDS';

// 카드의 순위를 판단하는 함수
function getCardRank(card) {
  return ( ranks.indexOf(card[0]) + (suits.indexOf(card[1])/10) );
}

function getCardNumber(card){
  return ranks.indexOf(card[0]);
}

// 핸드의 순위를 계산하는 함수. 수, 무늬도 보게끔 해야 함. ranks.indexOf(Main_card) + suits.indexOf(Main_card)/10
function calculateHandRank(hand, is_face) {
  const sortedHand = [...hand].sort((a, b) => getCardRank(b) - getCardRank(a)); // 높은 카드가 먼저 오도록 정렬

  const isFlush = (sortedHand.every(card => card[1] === sortedHand[0][1]) && sortedHand.length === 5);
  const isStraight = (sortedHand.every((card, index) => {
    if (index === 0) return true;
    return getCardNumber(card) === getCardNumber(sortedHand[index - 1]) - 1;
  }) && sortedHand.length === 5);

  const rankCounts = {};
  sortedHand.forEach(card => {
    const rank = card[0];
    rankCounts[rank] = (rankCounts[rank] || 0) + 1;
  });
  
  let pair_mainee = null;
  let pair_mainee_index = null;
  for (let i = 0; i < ranks.length; i++){
    if(rankCounts[ranks[i]] !== false){
      if(pair_mainee <= rankCounts[ranks[i]]){
        pair_mainee = rankCounts[ranks[i]];
        pair_mainee_index = ranks[i];
      }
    } 
  }
  
  const pair_main = sortedHand.filter(card => card[0] === pair_mainee_index).sort((a, b) => getCardRank(b) - getCardRank(a))[0];
  
  const counts = Object.values(rankCounts).sort((a, b) => b - a);
  if (is_face === false){ // face가 false인 경우 5장 보기의 승자를 return
    if (isStraight && isFlush) return { rank: 8, mainCard: sortedHand[0], highCard: sortedHand, hand: "Straight-Flush" }; // 스트레이트 플러시
    if (counts[0] === 4) return { rank: 7, mainCard: pair_main, highCard: sortedHand, hand: "Four-Cards" }; // 포카드
    if (counts[0] === 3 && counts[1] === 2) return { rank: 6, mainCard: pair_main, highCard: sortedHand, hand: "Full-House" }; // 풀하우스
    if (isFlush) return { rank: 5, mainCard: sortedHand[0], highCard: sortedHand, hand: "Flush" }; // 플러시
    if (isStraight) return { rank: 4, mainCard: sortedHand[0], highCard: sortedHand, hand: "Straight" }; // 스트레이트
    if (counts[0] === 3) return { rank: 3, mainCard: pair_main, highCard: sortedHand, hand: "Triple" }; // 트리플
    if (counts[0] === 2 && counts[1] === 2) return { rank: 2, mainCard: pair_main, highCard: sortedHand, hand: "Two Pair" }; // 투페어
    if (counts[0] === 2) return { rank: 1, mainCard: pair_main, highCard: sortedHand, hand: "One Pair" }; // 원페어
    return { rank: 0, mainCard: sortedHand[0], highCard: sortedHand, hand: "Top" }; // 높은 카드
  } else { // face가 true인 경우 액면 승자를 return
    if (counts[0] === 4) return { rank: 7, mainCard: pair_main, highCard: sortedHand, hand: "Four-Cards" }; // 포카드
    if (counts[0] === 3) return { rank: 3, mainCard: pair_main, highCard: sortedHand, hand: "Triple" }; // 트리플
    if (counts[0] === 2 && counts[1] === 2) return { rank: 2, mainCard: pair_main, highCard: sortedHand, hand: "Two Pair" }; // 투페어
    if (counts[0] === 2) return { rank: 1, mainCard: pair_main, highCard: sortedHand, hand: "One Pair" }; // 원페어
    return { rank: 0, mainCard: sortedHand[0], highCard: sortedHand, hand: "Top" }; // 높은 카드
  }   
}

// 두 핸드의 승자를 결정하는 함수
function compareHands(handA, handB, is_face) {
  const rankA = calculateHandRank(handA, is_face);
  const rankB = calculateHandRank(handB, is_face);

  if (rankA.rank > rankB.rank) return 1;
  if (rankA.rank < rankB.rank) return -1;

  // 같은 족보인 경우, 해당 족보에서 무늬와 숫자를 모두 고려해 더 높은 카드를 가진 사람이 이김

  const cardA = getCardRank(rankA.mainCard);
  const cardB = getCardRank(rankB.mainCard);
  if (cardA > cardB) return 1;
  if (cardA < cardB) return -1;


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

module.exports = { calculateHandRank, determineWinner, facemaker };
