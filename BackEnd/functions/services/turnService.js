const Game = require('../models/Game');

async function nextTurn({ game, isAi }) {
  if (!game) throw new Error('Juego no encontrado');

  const newTurn = game.currentTurn + 1;
  const newActualMana = game.manaPerTurn + game.actualMana;

  await Game.updateOne(
    { _id: game._id },
    {
      $set: {
        currentTurn: newTurn,
        actualMana: newActualMana,
        playerMana: newActualMana,
        rivalMana: newActualMana,
        'playerTable.$[].temporaryAbilities': [],
        'rivalTable.$[].temporaryAbilities': [],
      },
    }
  );

  await drawCard({ game, isAI: isAi });
}

async function drawCard({ game, isAI }) {
  const handField = isAI ? 'rivalHand' : 'playerHand';
  const pendingDeckField = isAI ? 'rivalPendingDeck' : 'playerPendingDeck';
  const hpField = isAI ? 'rivalHp' : 'playerHp';

  // Comprobar si la mano ya tiene 5 cartas
  if (game[handField].length >= 5) {
    return; // No se puede robar más cartas
  }

  if (game[pendingDeckField].length === 0) {
    await Game.updateOne(
      { _id: game._id },
      { $inc: { [hpField]: -1 } }
    );
  } else {
    const card = game[pendingDeckField][0];
    const newHand = [...game[handField], card];
    const newPendingDeck = game[pendingDeckField].slice(1);

    await Game.updateOne(
      { _id: game._id },
      {
        $set: {
          [handField]: newHand,
          [pendingDeckField]: newPendingDeck,
        },
      }
    );
  }
}

module.exports = { nextTurn, drawCard };
