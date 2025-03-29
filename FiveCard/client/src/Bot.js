import { determineWinner, facemaker, calculateHandRange } from './pokerHands';

const handleSendMessage = async (message, schema = null) => {
  const requestBody = { message };
  
  if (schema) {
    requestBody.schema = schema;
  }

  const res = await fetch('/api/bot-communication', { 
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  });

  const data = await res.json();

  if (res.status === 500) {
    return data.details;
  } else {
    return data.response;
  }
};

const cardMap = {
  "2H": "2-Hearts", "3H": "3-Hearts", "4H": "4-Hearts", "5H": "5-Hearts",
  "6H": "6-Hearts", "7H": "7-Hearts", "8H": "8-Hearts", "9H": "9-Hearts",
  "TH": "10-Hearts", "JH": "Jack-Hearts", "QH": "Queen-Hearts",
  "KH": "King-Hearts", "AH": "Ace-Hearts",

  "2D": "2-Diamonds", "3D": "3-Diamonds", "4D": "4-Diamonds", "5D": "5-Diamonds",
  "6D": "6-Diamonds", "7D": "7-Diamonds", "8D": "8-Diamonds", "9D": "9-Diamonds",
  "TD": "10-Diamonds", "JD": "Jack-Diamonds", "QD": "Queen-Diamonds",
  "KD": "King-Diamonds", "AD": "Ace-Diamonds",

  "2C": "2-Clubs", "3C": "3-Clubs", "4C": "4-Clubs", "5C": "5-Clubs",
  "6C": "6-Clubs", "7C": "7-Clubs", "8C": "8-Clubs", "9C": "9-Clubs",
  "TC": "10-Clubs", "JC": "Jack-Clubs", "QC": "Queen-Clubs",
  "KC": "King-Clubs", "AC": "Ace-Clubs",

  "2S": "2-Spades", "3S": "3-Spades", "4S": "4-Spades", "5S": "5-Spades",
  "6S": "6-Spades", "7S": "7-Spades", "8S": "8-Spades", "9S": "9-Spades",
  "TS": "10-Spades", "JS": "Jack-Spades", "QS": "Queen-Spades",
  "KS": "King-Spades", "AS": "Ace-Spades"
};

const convertCard = (card) => {
  return cardMap[card] || card;
};

const convertCardList = (cards) => {
  return cards.map(convertCard).join(", ");
};

const aifeedbackforOM = async(history, model, playerCount, language, style) => { // improvement is needed.
  if (model.every(item => item === "")) {
    return;
  }

  let mention = "I am playing TEXAS HOLD'EM. And I have established opponent modeling in this game, and I want to receive your feedback for it. I will give you three informations for each player. Opened cards for recent 5 games (including community cards and if open, the holding card of that player) and following betting records for each game, and my modeling of that player. ";
  for (let i = 0; i<history.length; i++){
    mention = mention.concat(" At ").concat(i).concat("th game, the community cards were ").concat(history[i].community_cards).concat(" followings are betting record in that game. ");
    for (let j = 1; j<playerCount; j++){
      mention = mention.concat(" Player ").concat(j).concat("'s pre-flop action was ").concat(history[i].betting_result[j].slice(0, history[i].betting_result[j].indexOf(1)));
      if(history[i].betting_result[j].includes(2)){
        mention = mention.concat(", flop action was ").concat(history[i].betting_result[j].slice(history[i].betting_result[j].indexOf(1)+1, history[i].betting_result[j].indexOf(2)));
        if(history[i].betting_result[j].includes(3)){
          mention = mention.concat(", turn action was ").concat(history[i].betting_result[j].slice(history[i].betting_result[j].indexOf(2)+1, history[i].betting_result[j].indexOf(3)));
          if(history[i].betting_result[j].includes(4)){
            mention = mention.concat(", river action was ").concat(history[i].betting_result[j].slice(history[i].betting_result[j].indexOf(3)+1, history[i].betting_result[j].indexOf(4))).concat(".");
          }
        }
      }
    }
    mention = mention.concat(" And in this game, player ").concat(history[i].final_players.map((value, index) => value ? index : -1).filter(index => index !== -1).join(', ')).concat("'s cards had been opened. ")
    for (let j = 1; j<playerCount; j++){
      if(history[i].final_players[j]){
        mention = mention.concat(" Player ").concat(j).concat("'s cards were ").concat(history[i].player_hands[j]).concat(", ");
      }
    }
    mention = mention.concat(" It ends the briefing of the game ").concat(i+1);
  }
  mention = mention.concat(" And my opponent modeling is following.");
  for (let i = 1; i<playerCount; i++){
    if (model[i-1].length !== 0){
      mention = mention.concat(" I modeled player ").concat(i).concat(" as following, '").concat(model[i-1]).concat("'");
    } 
  }
  mention = mention.concat(" And in fact, there are deliberated format for the style of these players. ");
  for (let i = 1; i<playerCount; i++){
    mention = mention.concat(" Player ").concat(i).concat(" has been designed as ").concat(style[i-1]).concat(" style, ");
  }
  mention = mention.concat(" How do you feedback for my opponent modeling? Please give me your idea for my opponent modeling in ").concat(language).concat(", without any special mark, particularly '*' and if I did not make any opponent modeling for one, then don't give me any hint or allusion for that. Additionally, DON'T directly mention that this player is systematically modeled as something. And you should briefly answer with the reasons because if you make a long answer then your answer will not be transmitted. I reemphasize that the reason of your idea is very important in spite of that you should give me briefly.");
  const feedback = await handleSendMessage(mention);
  console.log(mention);
  return new Promise((resolve) => {
    setTimeout(() => { 
      resolve({ feedback, mention });
    }, 0);
  });
}

const aiDecisionHoldem = async (indicator, survivor, hands, money, pot, is_final, raised, community, choicehistory, languageset, style, turnmoneymanage) => {
  if (money[indicator] === 0) { // all-in
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ decision: { action: "Call", amount: 0, explanation: "I did all-in."}});
      }, 0);
    });
  } 
  
  let mention = `You are playing TEXAS HOLD'EM. Analyze the current game state and decide your best action.`;
  
  // AI's Hole Cards
  mention += `\n### Your Hole cards: ${convertCardList(hands[indicator])}`;
  
  // Community Cards
  if (community.length > 0) {
    mention += `\n\n### Community Cards: ${convertCardList(community)}`;
    if (community.length !== 5){
      mention += `\nSo for now, with your hole cards, You are having **${JSON.stringify(calculateHandRange(hands[indicator], community, [], false).maxRank)}**. And your potential hand range based on current hole cards and possible future community cards is: ${JSON.stringify(calculateHandRange(hands[indicator], community).possibleRanks)}, of course the probability is varying.`
    } else {
      mention += `\nSo for now, with your hole cards, your hand is ${JSON.stringify(calculateHandRange(hands[indicator], community, [], false).maxRank)}.`;
    }
    // mention += `\n- Possible hands other players might have based on the board: [Analyze their potential hands].`;
  } else {
    mention += `\n- This is pre-flop, so community cards are not revealed yet.`;
  }
  // Betting Information
  mention += `\n\n### Betting Information:`;
  mention += `\n- Your current stack: ${money[indicator]}, and big blind is 100.`;
  mention += `\n- Pot size: ${pot}`;
  mention += `\n- Amount to call: ${raised - turnmoneymanage[indicator]}.`; // raised - turnmoneymanage[indicator] === 0 ? "nothing (free call)" : 
  
  // Opponents' Actions
  mention += `\n\n### Opponent Actions:`;
  for (let i = 0; i < survivor.length; i++) {
    if (survivor[i] && i !== indicator) {
      mention += `\n- Player ${i}: `;
      if (choicehistory[i].includes(1)) mention += `Pre-flop: ${choicehistory[i].slice(0, choicehistory[i].indexOf(1))}.`;
      if (choicehistory[i].includes(2)) mention += ` Flop: ${choicehistory[i].slice(choicehistory[i].indexOf(1) + 1, choicehistory[i].indexOf(2))}.`;
      if (choicehistory[i].includes(3)) mention += ` Turn: ${choicehistory[i].slice(choicehistory[i].indexOf(2) + 1, choicehistory[i].indexOf(3))}.`;
      if (choicehistory[i].includes(4)) mention += ` River: ${choicehistory[i].slice(choicehistory[i].indexOf(3) + 1, choicehistory[i].indexOf(4))}.`;
      mention += ` Stack: ${money[i]}.`;
    }
  }
  if (community.length > 0) {
    mention += `\n### Opponent's current, immediate hand range, so opponent may have for now based on the known board (excluding my cards) is: ${JSON.stringify(calculateHandRange([], community, hands[indicator]).possibleRanks)}`
    console.log(mention)
  }
  mention += `\n\n### Decision Making:`;
  mention += `\n- You should pretend to be a ${style} holdem player. (Avoid mentioning about it in your answer.)`;
  mention += `\n- Do you currently have a strong hand, or are you drawing?`;
  mention += `\n- What can you do with this situation? What's are you expecting with it? Do you want to bluff or not, value bet or fold or other thing?`;
  mention += `\n- Based on your plan and strategy, should you call, fold, or raise?`;
  mention += `\n- If you raise, what is your additional bet size?`;
  mention += `\n- If you call, what are the possible future scenarios?`;

  if (raised - turnmoneymanage[indicator] === 0){
    mention += `Which of one do you want to do? Check or bet? Call for simple answer.`
    let simple_schema = {
      "type": "object",
      "properties": {
        "action": {
          "type": "string",
          "enum": [
            "Check", "Bet"
          ],
          "description": "The player's chosen action for this betting round. 'Check' matches the current bet, 'Bet' increases the bet."
        }
      },
      "required": [
        "action"
      ],
      "additionalProperties": false
    }
    const decision_notjson = await handleSendMessage(mention, simple_schema);
    let decision = JSON.parse(decision_notjson)

    if (decision.action === "Bet") {
    } else {
      decision.amount = 0;
      decision.explanation = `I don't want to bet more in this pot for now, it is fast-check.`;
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ decision, mention });
        }, 0);
      });
    }
  }
  
  mention += `\n\n**Now, choose your action:**`;
  mention += `\n- Reply only with 'Fold.', 'Call.', or 'Raise.' first. (If raising, specify amount of additional bet with call money).`;
  mention += `\n- Raise is from ${raised === 0 ? pot * 0.1 : raised}, so if you do minimal raise, then ${money[indicator] - (raised - turnmoneymanage[indicator]) - (raised === 0 ? pot * 0.1 : raised)} left.`;
  mention += `\n- After your decision, explain your reasoning in 3-4 ${languageset} sentences using probability and logic based on GTO or exploitative poker theory.`;

  let schema = {
    "type": "object",
    "properties": {
      "action": {
        "type": "string",
        "enum": [
          "Call", "Fold", "Raise"
        ],
        "description": "The player's chosen action for this betting round. 'Call' matches the current bet, 'Fold' forfeits the hand, and 'Raise' increases the bet."
      },
      "amount": {
        "type": "number",
        "enum": generateAmountEnum(money, pot, indicator, raised - turnmoneymanage[indicator], raised), 
        "description": "You should fill it 0 when you do fold or call. The additional bet amount in chips. The minimum value is at least 1/10 of the pot, and the maximum value is the player's remaining stack."
      },
      "explanation": {
        "type": "string",
        "description": "A brief strategic explanation justifying the chosen action, including hand strength, opponent behavior, and game theory principles."
      }
    },
    "required": [
      "action",
      "amount",
      "explanation"
    ],
    "additionalProperties": false
  }
  
  const decision_notjson = await handleSendMessage(mention, schema);
  const decision = JSON.parse(decision_notjson)
  console.log(mention)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ decision, mention });
    }, 0);
  });
};

const generateAmountEnum = (money, pot, indicator, callfor, raised) => {
  const available = Math.max(money[indicator] - callfor, 0);
  const baseMin = raised === 0 ? pot * 0.1 : raised;
  const minTempAmount = Math.ceil(baseMin / 100) * 100;
  const maxTempAmount = Math.floor(available / 100) * 100;

  let stepSizes = [100, 500, 1000, 5000, 10000];
  let stepIndex = 0;
  let step = stepSizes[stepIndex]; 

  let estimatedCount = (maxTempAmount - minTempAmount) / step;

  while (estimatedCount > 500 && stepIndex < stepSizes.length - 1) {
    stepIndex++;
    step = stepSizes[stepIndex];
    estimatedCount = (maxTempAmount - minTempAmount) / step;
  }

  const minAmount = Math.ceil(baseMin / step) * step;
  const maxAmount = Math.floor(available / step) * step;

  if (maxAmount < minAmount) {
    return [0];
  }

  let amountEnum = [];
  for (let amount = minAmount; amount <= maxAmount; amount += step) {
    amountEnum.push(amount);
  }

  if (amountEnum.length === 0) {
    return [0];
  }
  
  return amountEnum;
}

const DecisionFBHoldem = async (indicator, survivor, hands, money, pot, is_final, choice, raised, community, choicehistory, languageset, turnmoneymanage) => {
  let mention = `I am playing TEXAS HOLD'EM. Analyze my decision and provide feedback on whether it was correct.`; 
  // AI's Hole Cards
  mention += `\n\n### My Hole cards: ${convertCardList(hands[indicator])}`;

  // Community Cards
  if (community.length > 0) {
    mention += `\n\n### Community Cards: ${convertCardList(community)}`;
    if (community.length !== 5){
      mention += `\nSo for now, with my hole cards, I am having **${JSON.stringify(calculateHandRange(hands[indicator], community, [], false).maxRank)}**. And my potential hand range based on current hole cards and possible future community cards is: ${JSON.stringify(calculateHandRange(hands[indicator], community).possibleRanks)}, of course the probability is varying.`
    } else {
      mention += `\nSo for now, with my hole cards, my hand is ${JSON.stringify(calculateHandRange(hands[indicator], community, [], false).maxRank)}.`;
    }
  } else {
    mention += `\n- This is pre-flop, so community cards are not revealed yet.`;
  }

  // Betting Information
  mention += `\n\n### Betting Information:`;
  mention += `\n- My current stack: ${money[indicator]}, and big blind is 100.`;
  mention += `\n- Pot size: ${pot}.`;
  mention += `\n- Amount to call: ${raised - turnmoneymanage[indicator] === 0 ? "nothing (free call)" : raised - turnmoneymanage[indicator]}.`;

  // Opponents' Actions
  mention += `\n\n### Opponent Actions:`;  
  for (let i = 0; i < survivor.length; i++) {
    if (survivor[i] && i !== indicator) {
      mention += `\n- Player ${i}: `;
      if (choicehistory[i].includes(1)) mention += `Pre-flop: ${choicehistory[i].slice(0, choicehistory[i].indexOf(1))}.`;
      if (choicehistory[i].includes(2)) mention += ` Flop: ${choicehistory[i].slice(choicehistory[i].indexOf(1) + 1, choicehistory[i].indexOf(2))}.`;
      if (choicehistory[i].includes(3)) mention += ` Turn: ${choicehistory[i].slice(choicehistory[i].indexOf(2) + 1, choicehistory[i].indexOf(3))}.`;
      if (choicehistory[i].includes(4)) mention += ` River: ${choicehistory[i].slice(choicehistory[i].indexOf(3) + 1, choicehistory[i].indexOf(4))}.`;
      mention += ` Stack: ${money[i]}.`;
    }
  }
  if (community.length > 0) {
    mention += `\n### Opponent's current, immediate hand range, so opponent may have for now based on the known board (excluding my cards) is: ${JSON.stringify(calculateHandRange([], community, hands[indicator]).possibleRanks)}`
  }
  if (raised - turnmoneymanage[indicator] === 0 && JSON.stringify(choice[0][choice[0].length - 1]) === JSON.stringify("call")){
    mention += `\nI did check for now.`
    let decision = {};
    decision.action = "Check"
    decision.amount = 0;
    decision.explanation = `You did check, and this is good choice because you can do free call for now.`
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ decision, mention });
      }, 0);
    });
  }

  // Player's Action and Request for Feedback
  mention += `\n\n### My Decision:`;
  mention += `\n- I chose to **${choice[0][choice[0].length - 1]}**.`;  
  mention += `\n- How do you evaluate this decision? If you were in my position, would you Call, Fold, or Raise?`;

  mention += `\n\n### Decision Making & Feedback:`;
  mention += `\n- Consider my current position and evaluate the likelihood that my hand is strong or weak.`;
  mention += `\n- Which player has the strongest possible hand based on the available cards?`;
  mention += `\n- What is the probability that an opponent has a better hand than mine? Provide reasoning using probability and logical deduction.`;
  mention += `\n- If you were to raise, what would be the optimal bet size based on GTO or exploitative strategy?`;
  mention += `\n- If you call, what are the possible future outcomes?`;

  mention += `\n\n**Now, provide your response:**`;
  mention += `\n- Reply only with 'Fold.', 'Call.', or 'Raise.' first. (If raising, specify amount).`;
  mention += `\n- Raise is from ${raised === 0 ? pot * 0.1 : raised}, so if you do minimal raise, then ${money[indicator] - (raised - turnmoneymanage[indicator]) - (raised === 0 ? pot * 0.1 : raised)} left.`;
  mention += `\n- Then, provide a strategic explanation in 3-4 ${languageset} sentences using probability and logic based on GTO or exploitative poker theory.`;

  let schema = {
    "type": "object",
    "properties": {
      "action": {
        "type": "string",
        "enum": ["Call", "Fold", "Raise"],
        "description": "Your evaluation of my action. Should I have called, folded, or raised?"
      },
      "amount": {
        "type": "number",
        "enum": generateAmountEnum(money, pot, indicator, raised - turnmoneymanage[indicator], raised),
        "description": "You should fill it 0 when you do fold or call. The bet amount in chips, increasing in increments of 100. The minimum value is at least 1/10 of the pot, and the maximum value is the player's remaining stack."
      },
      "explanation": {
        "type": "string",
        "description": "A concise strategic explanation justifying your recommendation, considering opponent hands, probability, and poker strategy."
      }
    },
    "required": ["action", "amount", "explanation"],
    "additionalProperties": false
  };
  console.log(mention)
  const decision_notjson = await handleSendMessage(mention, schema);
  const decision = JSON.parse(decision_notjson)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ decision, mention });
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
    let mention = "You are playing FIVE CARDS STUD. You are not able to have more than five cards. Here started new game. Your hand is ".concat(facemaker(turner(hands))[indicator]).concat(", and ").concat(turner(hands)[indicator][0]).concat(" which is hidden.").concat(" And you have ").concat(money[indicator]).concat(" as table money. Other players' hands are following. ");
    for (let i = 0; i<survivor.length; i++){
      if(survivor[i] && i !== indicator){
        mention = mention.concat("Player ").concat(i).concat("'s hand is ").concat(facemaker(turner(hands))[i]).concat(" and one card is hidden.").concat(" And this player has ").concat(money[i]).concat(" as table money. ");
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
  let mention = "I am playing FIVE CARDS STUD. I am not able to have more than five cards. Here started new game. My hand is ".concat(facemaker(turner(hands))[indicator]).concat(". And my first card, ").concat(hands[indicator][0]).concat(" is hidden.").concat(" And I have ").concat(money[indicator]).concat(" as table money. Other players' hands are following. ");
  for (let i = 0; i<survivor.length; i++){
    if(survivor[i] && i !== indicator){
      mention = mention.concat("Player ").concat(i).concat("'s hand is ").concat(facemaker(turner(hands))[i]).concat(" and one card is hidden.").concat(" And this player has ").concat(money[i]).concat(" as table money. ");
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
    let mention = "You are playing FIVE CARDS DRAW. You are not able to have more than five cards and you are not able to have same cards if you conceive so, then you are misunderstanding your hand, so recheck it. Here started new game. Your hand is ".concat(turner(hands)[indicator]).concat(". And all of your cards are hidden.").concat(" And you have ").concat(money[indicator]).concat(" as table money. Other players' table moneys are following. ");
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
  let mention = "I am playing FIVE CARDS STUD. I am not able to have more than five cards and I am not able to have same cards if you conceive so, then you are misunderstanding my hand, so recheck it. Here started new game. My hand is ".concat(turner(hands)[indicator]).concat(". And all of my card is hidden.").concat(" And I have ").concat(money[indicator]).concat(" as table money. Other players' table moneys are following. ");
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

export { aifeedbackforOM, aiDecisionStud, DecisionFBStud, aiDecisionDraw, DecisionFBDraw, aiDecisionHoldem, DecisionFBHoldem };