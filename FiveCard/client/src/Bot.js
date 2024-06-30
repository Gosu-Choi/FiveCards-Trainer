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

const aiDecisionStud = async (indicator, survivor, hands, money, pot, is_final) => {
  let mention = "You are playing FIVE CARDS STUD. You are not able to have more than five cards. Here started new game. Your hand is ".concat(turner(hands)[indicator]).concat(". And your first card, ").concat(hands[indicator][0]).concat(" is hidden. And you have ").concat(money[indicator]).concat(" as table money. Other players' hands are following. ");
  for (let i = 0; i<survivor.length; i++){
    if(survivor[i] && i !== indicator){
      mention = mention.concat("Player ").concat(i).concat("'s hand is ").concat(facemaker(turner(hands))[i]).concat(" and one card is hidden. And this player has ").concat(money[i]).concat(" as table money. ");
    }
  }
  mention = mention.concat(" Would you call or fold or raise? Just answer with simple one word with mark so like 'Fold.' or 'Raise.' or 'Call.'. One thing, if you want to raise, you should bet 1.5 times of the pot. Now the pot money is ").concat(pot).concat(". And please RECHECK YOUR HANDS. In many cases, people overestimate their hands.");
  mention = mention.concat(" You should win this game. If you lose all money then you will lost everything. So you should use all of the strategy available. And after give me your decision like 'Fold.' or 'Raise.' or 'Call.', give me your rationale and strategy why you make that decision.");
  if (is_final) {
    mention = mention.concat(" And this is final phase of betting, you are not able to receive additional card and You are not able to find any additional potential for your hands.");
  }
  const decision = await handleSendMessage(mention);
  return new Promise((resolve) => {
    setTimeout(() => { 
      resolve({ decision });
    }, 0);
  });
};

const DecisionFBStud = async (indicator, survivor, hands, money, pot, is_final, my_choice) => {
  let mention = "I am playing FIVE CARDS STUD. I am not able to have more than five cards. Here started new game. My hand is ".concat(turner(hands)[indicator]).concat(". And your first card, ").concat(hands[indicator][0]).concat(" is hidden. And you have ").concat(money[indicator]).concat(" as table money. Other players' hands are following. ");
  for (let i = 0; i<survivor.length; i++){
    if(survivor[i] && i !== indicator){
      mention = mention.concat("Player ").concat(i).concat("'s hand is ").concat(facemaker(turner(hands))[i]).concat(" and one card is hidden. And this player has ").concat(money[i]).concat(" as table money. ");
    }
  }
  mention = mention.concat("I chose to ").concat(my_choice).concat(". How do you feedback for my decision? If you were I, What would you do call or fold or raise? First, just answer with simple one word like 'Fold.' or 'Raise.' or 'Call.'. And please give me very critical idea of you with all five poker strategy even from internet for 3-4 sentences. One thing, if you want to raise, you should bet 1.5 times of the pot. Now the pot money is ").concat(pot).concat(". And please RECHECK YOUR HANDS. In many cases, people overestimate their hands.");
  mention = mention.concat(" I must win this game. And you should use all of the five poker strategy available.");
  if (is_final) {
    mention = mention.concat(" And this is final phase of betting, I was not able to receive additional card and I was not able to find any additional potential for my hands.");
  }
  const decision = await handleSendMessage(mention);
  return new Promise((resolve) => {
    setTimeout(() => { 
      resolve({ decision });
    }, 0);
  });
};

let dictionaryforterm1 = {"T":"Ten", "J":"Jack", "K":"King", "Q":"Queen", "A": "Ace", "2":"Two", "3": "Three", "4": "Four", "5": "Five", "6": "Six", "7": "Seven", "8": "Eight",  "9": "Nine"};
let dictionaryforterm2 = {"D": "Diamonds", "C": "Clubs", "S":"Spades", "H": "Hearts"};

const turner = (hands) => { 
  let turnedHand = hands.map(hand => hand.map(card => [...card]));
  for (let i=0; i<turnedHand.length; i++){
    for (let j=0; j<turnedHand[i].length; j++){
      turnedHand[i][j] = " ".concat(dictionaryforterm2[hands[i][j][1]]).concat(" ").concat(dictionaryforterm1[hands[i][j][0]]);
    }
  }
  return turnedHand;
}

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

export { aiDecisionStud, DecisionFBStud };