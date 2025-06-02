const Game = require('../models/Game');
const Player = require('../models/Player');
const mongoose = require('mongoose');

// quitar las cartas de spell que estan dentro del array de equipamientos
async function nextTurn({ game }) {
  if (!game) throw new Error('Juego no encontrado');

  const newTurn = game.currentTurn + 1;
  const newActualMana = game.manaPerTurn + game.actualMana;

  // Limpiar spells de los equipements de cada carta en ambas mesas y pasarlos al graveyard correspondiente
  let spellsToGraveyardPlayer = [];
  let spellsToGraveyardRival = [];

  const cleanEquipements = (table, isPlayer) =>
    table.map(card => {
      const cardObj = card.toObject?.() ? card.toObject?.() : card;
      const equipements = cardObj.equipements || [];
      const spells = equipements.filter(eq => eq.type === 'spell');
      if (spells.length > 0) {
        if (isPlayer) spellsToGraveyardPlayer.push(...spells);
        else spellsToGraveyardRival.push(...spells);
      }
      return {
        ...cardObj,
        equipements: equipements.filter(eq => eq.type !== 'spell')
      };
    });

  const updatedPlayerTable = cleanEquipements(game.playerTable, true);
  const updatedRivalTable = cleanEquipements(game.rivalTable, false);

  console.log('\n----------------------------------------------------------------------\nPlayerTable sin equipements ==> ', updatedPlayerTable);
  console.log('\n----------------------------------------------------------------------\nRivalTable sin equipements ==> ', updatedRivalTable);

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

  // 2. Actualizar los equipements filtrados (sin spells) y añadir spells al graveyard
  await Game.updateOne(
    { _id: game._id },
    {
      $set: {
        playerTable: updatedPlayerTable,
        rivalTable: updatedRivalTable
      },
      $push: {
        playerGraveyard: { $each: spellsToGraveyardPlayer },
        rivalGraveyard: { $each: spellsToGraveyardRival }
      }
    }
  );

  console.log('\n----------------------------------------------------------------------\nSpells del jugador al graveyard ==> ', spellsToGraveyardPlayer);
  console.log('\n----------------------------------------------------------------------\nSpells del rival al graveyard ==> ', spellsToGraveyardRival);
}

async function drawCard({ game, isAI }) {
  const handField = isAI ? 'rivalHand' : 'playerHand';
  const pendingDeckField = isAI ? 'rivalPendingDeck' : 'playerPendingDeck';
  const hpField = isAI ? 'rivalHp' : 'playerHp';

  console.log('\n----------------------------------------------------------------------\nhandField ==> ', handField);
  console.log('\n----------------------------------------------------------------------\npendingDeckField ==> ', pendingDeckField);
  console.log('\n----------------------------------------------------------------------\nhpField ==> ', hpField);

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

    console.log('\n----------------------------------------------------------------------\nCard to draw ==> ', card);
    // Forzar el _id a ObjectId para el $pull
    const cardId = typeof card._id === 'string' ? mongoose.Types.ObjectId(card._id) : card._id;
    await Game.updateOne(
      { _id: game._id },
      {
        $push: { [handField]: card },
        $pull: { [pendingDeckField]: { _id: cardId } }
      }
    );
  }
}

async function checkForGameOver(game) {
  if (game.playerHp <= 0 || game.rivalHp <= 0) {
    const winner = game.playerHp > 0 ? 'player' : 'rival';
    await Game.updateOne(
      { _id: game._id },
      { $set: { winner } }
    );

    // Experiencia y nivelado
    const player = await Player.findOne({ uid: game.playerId });
    if (player) {
      let expToAdd = winner === 'player' ? 200 : 100;
      let newProgress = (player.player_level_progress || 0) + expToAdd;
      let newLevel = player.player_level || 0;
      // Sube de nivel si llega a 1000 o más
      if (newProgress >= 1000) {
        const levelsToAdd = Math.floor(newProgress / 1000);
        newLevel += levelsToAdd;
        newProgress = newProgress % 1000;
      }
      await Player.updateOne(
        { uid: game.playerId },
        {
          $set: {
            player_level: newLevel,
            player_level_progress: newProgress
          }
        }
      );
    }
    return true; // El juego ha terminado
  }
  return false; // El juego sigue activo
}

module.exports = { nextTurn, drawCard, checkForGameOver };
