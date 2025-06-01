const Game = require('../models/Game');

// quitar las cartas de spell que estan dentro del array de equipamientos
async function nextTurn({ game }) {
  if (!game) throw new Error('Juego no encontrado');

  const newTurn = game.currentTurn + 1;
  const newActualMana = game.manaPerTurn + game.actualMana;

  // Limpiar spells de los equipements de cada carta en ambas mesas
  const cleanEquipements = table =>
    table.map(card => ({
      ...card.toObject?.() || card,
      equipements: (card.equipements || []).filter(eq => eq.type !== 'spell')
    }));

  const updatedPlayerTable = cleanEquipements(game.playerTable);
  const updatedRivalTable = cleanEquipements(game.rivalTable);

  // 1. Limpiar temporaryAbilities de todas las cartas
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

  // 2. Actualizar los equipements filtrados (sin spells)
  await Game.updateOne(
    { _id: game._id },
    {
      $set: {
        playerTable: updatedPlayerTable,
        rivalTable: updatedRivalTable
      },
    }
  );
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
