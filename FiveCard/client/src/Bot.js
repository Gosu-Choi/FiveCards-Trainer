function aiDecision() {
    const actions = ['fold', 'call', 'raise'];
    const decision = actions[Math.floor(Math.random() * actions.length)];
    return { decision };
  }

 module.exports = { aiDecision };