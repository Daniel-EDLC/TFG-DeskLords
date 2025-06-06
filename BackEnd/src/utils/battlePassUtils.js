function generateDefaultLevels() {
  return [
    { type: 'coins', rewards: { coins: 50, image: ""} },
    { type: 'coins', rewards: { coins: 100, image: "" } },
    { type: 'coins', rewards: { coins: 150, image: "" } },
    { type: 'coins', rewards: { coins: 200, image: "" } },
    { type: 'avatar', rewards: { avatarId: 'IdDocumento', image: "" } },
    { type: 'coins', rewards: { coins: 250 }, image: "" },
    { type: 'coins', rewards: { coins: 300 }, image: "" },
    { type: 'coins', rewards: { coins: 350 }, image: "" },
    { type: 'coins', rewards: { coins: 400 }, image: "" },
    { type: 'deck', rewards: { deckId: '22222', image: "" } },
  ];
}

module.exports = { generateDefaultLevels };