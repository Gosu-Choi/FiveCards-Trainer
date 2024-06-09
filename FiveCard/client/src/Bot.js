function aiDecision(bot_number, activePlayers, Revealed_hands) {
    const actions = ['fold', 'call', 'raise'];
    const decision = actions[Math.floor(Math.random() * actions.length)];
    return { decision };
  }

 module.exports = { aiDecision };