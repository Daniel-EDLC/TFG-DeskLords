function generateDefaultLevels() {
  return [
    { type: 'coins', rewards: { coins: 50 } },
    { type: 'coins', rewards: { coins: 100 } },
    { type: 'coins', rewards: { coins: 150 } },
    { type: 'coins', rewards: { coins: 200 } },
    { type: 'avatar', rewards: { avatarId: 'IdDocumento' } },
    { type: 'coins', rewards: { coins: 250 } },
    { type: 'coins', rewards: { coins: 300 } },
    { type: 'coins', rewards: { coins: 350 } },
    { type: 'coins', rewards: { coins: 400 } },
    { type: 'deck', rewards: { deckId: '22222' } },
  ];
}

module.exports = { generateDefaultLevels };