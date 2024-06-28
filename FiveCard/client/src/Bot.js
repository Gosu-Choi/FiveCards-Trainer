import { calculateHandRank, determineWinner, facemaker } from './pokerHands';

const handleSendMessage = async (message) => {
  const res = await fetch('http://localhost:5000/bot-communication', { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message })
    });
  const data = await res.json();
  return data.response
}

const aiDecision = async (indicator, survivor, hands, money, pot, is_final) => {
  let mention = "You are playing five cards stud. Your hand is ".concat(hands[indicator]).concat("and your first card, ").concat(hands[indicator][0]).concat("is hidden. And you have ").concat(money[indicator]).concat(" as table money. Other players' hands are following.");
  for (let i = 0; i<survivor.length; i++){
    if(survivor[i] && i !== indicator){
      mention = mention.concat("player ").concat(i).concat("'s hand is ").concat(facemaker(hands)[i]).concat(" and one card is hidden. And this player has ").concat(money[i]).concat(" as table money.");
    }
  }
  mention = mention.concat(" Would you call or fold or raise? Just answer with simple one word without any mark so like 'Fold' or 'Raise' or 'Call'. One thing, if you want to raise, you should bet 1.5 times of the pot. Now the pot money is ").concat(pot).concat(".");
  mention = mention.concat(" You should win this game and you should remember this is not the last phase of the betting. If you lose all money then you will lost everything. So you should use all of the strategy available.");
  if (is_final) {
    mention = mention.concat(" And this is final phase of betting.");
  }
  const decision = await handleSendMessage(mention);
  return new Promise((resolve) => {
    setTimeout(() => { 
      resolve({ decision });
    }, 500);
  });
};

// const aiDecision = async (indicator, survivor, hands, is_final) => {
//   return new Promise((resolve) => {
//     setTimeout(() => { 
//       const roll = Math.random();
//       let decision;
//       if (is_final) { 
//         const myHands = calculateHandRank(hands[indicator], false); 
//         const faceHands = new Array(survivor.length).fill(false);
//         for (let i = 0; i<survivor.length; i++){
//           faceHands[i] = calculateHandRank(facemaker(hands)[i], true);
//         }
//         if (faceHands.filter(facehand => facehand !== false).every(facehand => facehand.rank <= myHands.rank)) {
//           if (roll > 0.9){
//             decision = "raise";
//           } else {
//             decision = "call";
//           }
//         } else {
//           if (roll > 0.9){
//             decision = "raise";
//           } else if (roll > 0.7){
//             decision = "call";
//           } else {
//             decision = "fold";
//           }
//         }
//       } else {
//         const myHands = calculateHandRank(hands[indicator], true); 
//         const faceHands = new Array(survivor.length).fill(false);
//         for (let i = 0; i<survivor.length; i++){
//           faceHands[i] = calculateHandRank(facemaker(hands)[i], true);
//         }
//         if (faceHands.filter(facehand => facehand !== false).every(facehand => facehand.rank <= myHands.rank)) {
//           if (roll > 0.7){
//             decision = "raise";
//           } else {
//             decision = "call";
//           }
//         } else {
//           if (roll > 0.9){
//             decision = "raise";
//           } else if (roll > 0.7){
//             decision = "call";
//           } else {
//             decision = "fold";
//           }
//         }
//       }
//       resolve({ decision });
//     }, 500);
//   });
// };

export { aiDecision };