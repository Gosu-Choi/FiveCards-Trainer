const aiDecision = async() => {
    const actions = ['fold', 'call'];
    const decision = actions[Math.floor(Math.random() * actions.length)];
    return { decision };
  }

 module.exports = { aiDecision };