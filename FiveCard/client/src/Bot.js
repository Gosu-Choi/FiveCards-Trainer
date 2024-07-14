import { calculateHandRank, determineWinner, facemaker } from './pokerHands';

const handleSendMessage = async (message) => {
  const res = await fetch('/api/bot-communication', { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message })
    });
  const data = await res.json();
  if (res.status === 500){
    return data.details;
  } else {
    return data.response;
  }
  
}

const aiDecisionHoldem = async (indicator, survivor, hands, money, pot, is_final, raised, community, choicehistory, languageset) => {
  if (money[indicator] === 0){
    const decision = "Call.";
    return new Promise((resolve) => {
      setTimeout(() => { 
        resolve({ decision });
      }, 0);
    });
  } else {
    let mention = "You are playing TEXAS HOLD'EM. You should consider your hands as well as the community cards. Your hand is ".concat(hands[indicator]).concat(community.length > 0 ? ", and the community cards are sequentially " : ", and this is pre-flop, so the community cards are not shown yet.").concat(community).concat(community.length > 0 ? ", so the first three cards are flops. And you have " : ". And you have ").concat(money[indicator]).concat(" as table money. Other players' action on each betting phase are following. ");
    for (let i = 0; i<survivor.length; i++){
      if(survivor[i] && i !== indicator && community.length > 0 && choicehistory[i].length > 0){
        mention = mention.concat("Player ").concat(i).concat("'s pre-flop action was ").concat(choicehistory[i][0]);
        if(choicehistory[i].length > 1 && community.length > 2){
          mention = mention.concat(", flop action was ").concat(choicehistory[i][1]);
          if(choicehistory[i].length > 2 && community.length > 3){
            mention = mention.concat(", turn action was ").concat(choicehistory[i][2]);
            if(choicehistory[i].length > 3 && community.length > 4){
              mention = mention.concat(", river action was ").concat(choicehistory[i][3]);
            }
          }
        }
        mention = mention.concat(". And this player has ").concat(money[i]).concat(" as table money. ");
      }
    }
    mention = mention.concat(" And you should be aware of that players including you can do bluffing when environment is good. Would you call or fold or raise? Just answer with simple one word with mark so like 'Fold.' or 'Raise.' or 'Call.'. If you want to raise, you should bet 1/2 times of the pot(stake). Now the pot money is ").concat(pot).concat(". If you want to call, you should bet ").concat(raised === 0 ? "nothing. It is extremely preferred to call or raise when you should bet nothing." : raised);
    mention = mention.concat(" You should use all of the strategy available and all the environment including enemies' hands and table moneys, I mean, you must use Game Theory Optimal. And after give me your decision like 'Fold.' or 'Raise.' or 'Call.', give me your rationale and strategy why you make that decision for 3-4 simple ").concat(languageset).concat(" sentences about the logic including the possibility that a player makes strong hand which is able to beat your hand and the probability based on Game Theory Optimal, without any special marks. Remember, don't say meaningless mention because you cannot say many words.");
    if (is_final) {
      mention = mention.concat(" And this is final phase of betting, you are not able to receive additional card.");
    }
    const decision = await handleSendMessage(mention);
    return new Promise((resolve) => {
      setTimeout(() => { 
        resolve({ decision });
      }, 0);
    });
  }
};

const DecisionFBHoldem = async (indicator, survivor, hands, money, pot, is_final, choice, raised, community, choicehistory, languageset) => {
  let mention = "I am playing TEXAS HOLD'EM. You should consider your hands as well as the community cards. My hand is ".concat(hands[indicator]).concat(community.length > 0 ? ", and the community cards are sequentially " : ", and this is pre-flop, so the community cards are not shown yet.").concat(community).concat(community.length > 0 ? ", so the first three cards are flops. And I have " : ". And I have ").concat(money[indicator]).concat(" as table money. Other players' action on each betting phase are following. ");
  for (let i = 0; i<survivor.length; i++){
    if(survivor[i] && i !== indicator && community.length > 0 && choicehistory[i].length > 0){
      mention = mention.concat("Player ").concat(i).concat("'s pre-flop action was ").concat(choicehistory[i][0]);
      if(choicehistory[i].length > 1 && community.length > 2){
        mention = mention.concat(", flop action was ").concat(choicehistory[i][1]);
        if(choicehistory[i].length > 2 && community.length > 3){
          mention = mention.concat(", turn action was ").concat(choicehistory[i][2]);
          if(choicehistory[i].length > 3 && community.length > 4){
            mention = mention.concat(", river action was ").concat(choicehistory[i][3]);
          }
        }
      }
      mention = mention.concat(". And this player has ").concat(money[i]).concat(" as table money. ");
    }
  }
  mention = mention.concat("I chose to ").concat(choice[0][choice[0].length-1]).concat(". How do you feedback for my decision? If you were I, What would you do call or fold or raise? And you should be aware of that players can do bluffing. First, just answer with simple one word like 'Fold.' or 'Raise.' or 'Call.'. And please give me very practical idea for 3-4 simple ").concat(languageset).concat(" sentences sentences about the logic including player who has the most strong visual hand and the possibility that the player makes that strong hand, without any special marks. (e.g. 'Player 3 can make hearts flush if the hidden card is heart, and that probability would be about ~%'). Remember, don't say meaningless mention because you cannot say many words. If you want to raise, you should bet 1/2 times of the pot. Now the pot money is ").concat(pot).concat(". If you want to call, you should bet ").concat(raised === 0 ? "nothing. It is extremely preferred to call or raise when you should bet nothing." : raised);
  mention = mention.concat(" You should use all of the five poker strategy available and all the environment including enemies' hands and table moneys, I mean, you must use Game Theory Optimal and give me your betting rationale based on that.");
  const decision = await handleSendMessage(mention);
  return new Promise((resolve) => {
    setTimeout(() => { 
      resolve({ decision });
    }, 0);
  });
};

// For FiveCardsStud

const aiDecisionStud = async (indicator, survivor, hands, money, pot, is_final, raised, languageset) => {
  if (money[indicator] === 0){
    const decision = "Call.";
    return new Promise((resolve) => {
      setTimeout(() => { 
        resolve({ decision });
      }, 0);
    });
  } else {
    let mention = "You are playing FIVE CARDS STUD. You are not able to have more than five cards. Here started new game. Your hand is ".concat(facemaker(turner(hands))[indicator]).concat(", and ").concat(turner(hands)[indicator][0]).concat(" which is hidden. So the rank of your hand for now is ").concat(calculateHandRank(hands[indicator], false).hand).concat(" And you have ").concat(money[indicator]).concat(" as table money. Other players' hands are following. ");
    for (let i = 0; i<survivor.length; i++){
      if(survivor[i] && i !== indicator){
        mention = mention.concat("Player ").concat(i).concat("'s hand is ").concat(facemaker(turner(hands))[i]).concat(" and one card is hidden. So the rank of his visual hand is ").concat(calculateHandRank(facemaker(hands)[i], true).hand).concat(" And this player has ").concat(money[i]).concat(" as table money. ");
      }
    }
    mention = mention.concat(" And you should be aware of that players including you can do bluffing when environment is good. Would you call or fold or raise? Just answer with simple one word with mark so like 'Fold.' or 'Raise.' or 'Call.'. If you want to raise, you should bet 1.5 times of the pot(stake). Now the pot money is ").concat(pot).concat(". If you want to call, you should bet ").concat(raised === 0 ? "nothing. It is extremely preferred to call or raise when you should bet nothing." : raised).concat(". And please RECHECK YOUR HANDS. In many cases, people overestimate their hands.");
    mention = mention.concat(" You should use all of the strategy available and all the environment including enemies' hands and table moneys. And after give me your decision like 'Fold.' or 'Raise.' or 'Call.', give me your rationale and strategy why you make that decision for 3-4 simple ").concat(languageset).concat(" sentences about the logic including player who has the most strong visual hand and the possibility that the player makes that strong hand, without any special marks. Remember, don't say meaningless mention because you cannot say many words.");
    if (is_final) {
      mention = mention.concat(" And this is final phase of betting, you are not able to receive additional card and You are not able to find any additional potential for your hands.");
    }
    const decision = await handleSendMessage(mention);
    return new Promise((resolve) => {
      setTimeout(() => { 
        resolve({ decision });
      }, 0);
    });
  }
};

const DecisionFBStud = async (indicator, survivor, hands, money, pot, is_final, my_choice, raised, languageset) => {
  let mention = "I am playing FIVE CARDS STUD. I am not able to have more than five cards. Here started new game. My hand is ".concat(facemaker(turner(hands))[indicator]).concat(". And my first card, ").concat(hands[indicator][0]).concat(" is hidden. So the rank of my hand is ").concat(calculateHandRank(hands[indicator], false).hand).concat(" And I have ").concat(money[indicator]).concat(" as table money. Other players' hands are following. ");
  for (let i = 0; i<survivor.length; i++){
    if(survivor[i] && i !== indicator){
      mention = mention.concat("Player ").concat(i).concat("'s hand is ").concat(facemaker(turner(hands))[i]).concat(" and one card is hidden. So the rank of his visual hand is ").concat(calculateHandRank(facemaker(hands)[i], true).hand).concat(" And this player has ").concat(money[i]).concat(" as table money. ");
    }
  }
  mention = mention.concat("I chose to ").concat(my_choice).concat(". How do you feedback for my decision? If you were I, What would you do call or fold or raise? And you should be aware of that players can do bluffing. First, just answer with simple one word like 'Fold.' or 'Raise.' or 'Call.'. And please give me very practical idea for 3-4 simple ").concat(languageset).concat(" sentences sentences about the logic including player who has the most strong visual hand and the possibility that the player makes that strong hand, without any special marks. (e.g. 'Player 3 can make hearts flush if the hidden card is heart, and that probability would be about ~%'). Remember, don't say meaningless mention because you cannot say many words. If you want to raise, you should bet 1.5 times of the pot. Now the pot money is ").concat(pot).concat(". If you want to call, you should bet ").concat(raised === 0 ? "nothing. It is extremely preferred to call or raise when you should bet nothing." : raised).concat(". And please RECHECK YOUR HANDS. In many cases, people overestimate their hands.");
  mention = mention.concat(" You should use all of the five poker strategy available and all the environment including enemies' hands and table moneys.");
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

// For FiveCardsDraw

const aiDecisionDraw = async (indicator, survivor, hands, money, pot, is_final, raised, languageset) => {
  if (money[indicator] === 0){
    const decision = "Call.";
    return new Promise((resolve) => {
      setTimeout(() => { 
        resolve({ decision });
      }, 0);
    });
  } else {
    let mention = "You are playing FIVE CARDS DRAW. You are not able to have more than five cards and you are not able to have same cards if you conceive so, then you are misunderstanding your hand, so recheck it. Here started new game. Your hand is ".concat(turner(hands)[indicator]).concat(". And all of your cards are hidden. So the rank of your hand is ").concat(calculateHandRank(hands[indicator], false).hand).concat(" And you have ").concat(money[indicator]).concat(" as table money. Other players' table moneys are following. ");
    for (let i = 0; i<survivor.length; i++){
      if(survivor[i] && i !== indicator){
        mention = mention.concat("Player ").concat(i).concat(" has ").concat(money[i]).concat(" as table money. ");
      }
    }
    mention = mention.concat(" And you should be aware of that players including you can do bluffing when environment is good. Would you call or fold or raise? Just answer with simple one word with mark so like 'Fold.' or 'Raise.' or 'Call.'. If you want to raise, you should bet 1.5 times of the pot. Now the pot money is ").concat(pot).concat(". If you want to call, you should bet ").concat(raised === 0 ? "nothing. It is extremely preferred to call or raise when you should bet nothing." : raised).concat(". And please RECHECK YOUR HANDS. In many cases, people overestimate their hands.");
    mention = mention.concat(" You should win this game. If you lose all money then you will lost everything. So you should use all of the strategy available and all the environment including enemies' hands and table moneys. And after give me your decision like 'Fold.' or 'Raise.' or 'Call.', give me your rationale and strategy why you make that decision for 3-4 simple ").concat(languageset).concat(" sentences including numerical calculation like win probability of the rank as long as it is not too complex, without any special marks. (e.g. 'win probability of ~ hand is commonly ~% in five card stud') Remember, don't say meaningless mention because you cannot say many words.");
    if (is_final) {
      mention = mention.concat(" And this is final phase of betting, you are not able to receive additional card and You are not able to find any additional potential for your hands.");
    }
    const decision = await handleSendMessage(mention);
    return new Promise((resolve) => {
      setTimeout(() => { 
        resolve({ decision });
      }, 0);
    });
  }
};

const DecisionFBDraw = async (indicator, survivor, hands, money, pot, is_final, my_choice, raised, languageset) => {
  let mention = "I am playing FIVE CARDS STUD. I am not able to have more than five cards and I am not able to have same cards if you conceive so, then you are misunderstanding my hand, so recheck it. Here started new game. My hand is ".concat(turner(hands)[indicator]).concat(". And all of my card is hidden. So the rank of your hand is ").concat(calculateHandRank(hands[indicator], false).hand).concat(" And I have ").concat(money[indicator]).concat(" as table money. Other players' table moneys are following. ");
  for (let i = 0; i<survivor.length; i++){
    if(survivor[i] && i !== indicator){
      mention = mention.concat("Player ").concat(i).concat(" has ").concat(money[i]).concat(" as table money. ");
    }
  }
  mention = mention.concat("I chose to ").concat(my_choice).concat(". How do you feedback for my decision? If you were I, What would you do call or fold or raise? And you should be aware of that players can do bluffing. First, just answer with simple one word like 'Fold.' or 'Raise.' or 'Call.'. And please give me very practical idea for 3-4 simple ").concat(languageset).concat(" sentences including numerical calculation like win probability of the rank as long as it is not too complex, without any special marks (e.g. 'win probability of ~ hand is commonly ~% in five card stud'). Remember, don't say meaningless mention because you cannot say many words. If you want to raise, you should bet 1.5 times of the pot. Now the pot money is ").concat(pot).concat(". If you want to call, you should bet ").concat(raised === 0 ? "nothing. It is extremely preferred to call or raise when you should bet nothing." : raised).concat(". And please RECHECK YOUR HANDS. In many cases, people overestimate their hands.");
  mention = mention.concat(" I must win this game. And you should use all of the five poker strategy available and all the environment including enemies' hands and table moneys.");
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
let dictionaryforterm2 = {"D": "♦", "C": "♣", "S":"♠", "H": "♥"};

const turner = (hands) => { 
  let turnedHand = hands.map(hand => hand.map(card => [...card]));
  for (let i=0; i<turnedHand.length; i++){
    for (let j=0; j<turnedHand[i].length; j++){
      turnedHand[i][j] = hands[i][j][0].concat(dictionaryforterm2[hands[i][j][1]]);
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

export { aiDecisionStud, DecisionFBStud, aiDecisionDraw, DecisionFBDraw, aiDecisionHoldem, DecisionFBHoldem };