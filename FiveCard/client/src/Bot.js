import { calculateHandRank, determineWinner, facemaker } from './pokerHands';

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

export { aiDecision };