const Game = require('../models/Game');
const Player = require('../models/Player');
const mongoose = require('mongoose');

async function nextTurn({ game }) {
  if (!game) throw new Error('Juego no encontrado');

  const newTurn = game.currentTurn + 1;

  let newPlayerMana = game.playerMana;
  let newRivalmana = game.rivalMana;

  if (newTurn % 2 !== 0) {
    newPlayerMana = game.playerMana + game.manaPerTurn;
    newRivalmana = game.rivalMana + game.manaPerTurn;
  }


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

  // console.log('\n----------------------------------------------------------------------\nPlayerTable sin spells en equipements ==> ', updatedPlayerTable);
  // console.log('\n----------------------------------------------------------------------\nRivalTable sin spells en equipements ==> ', updatedRivalTable);

  // 1. Limpiar temporaryAbilities de todas las cartas
  await Game.updateOne(
    { _id: game._id },
    {
      $set: {
        currentTurn: newTurn,
        playerMana: newPlayerMana,
        rivalMana: newRivalmana,
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
  // console.log('\n----------------------------------------------------------------------\nSpells del jugador al graveyard ==> ', spellsToGraveyardPlayer);
  // console.log('\n----------------------------------------------------------------------\nSpells del rival al graveyard ==> ', spellsToGraveyardRival);

  const updatedGame = await Game.findById(game._id);

  // 3. Actualizar las cartas en la mesa para que no sean nuevas
  let playerTable = updatedGame.playerTable.map(card => {
    const base = card.toObject?.() || card;
    return {
      ...base,
      new: false // false porque ya no es una carta recién jugada
    };
  });

  let rivalTable = updatedGame.rivalTable.map(card => {
    const base = card.toObject?.() || card;
    return {
      ...base,
      new: false // false porque ya no es una carta recién jugada
    };
  });
  await Game.updateOne(
    { _id: updatedGame._id },
    {
      $set: {
        playerTable,
        rivalTable,
      },
    }
  );

  // console.log('\n----------------------------------------------------------------------\nMesa del jugador actualizada sin cartas nuevas ==> ', playerTable);
  // console.log('\n----------------------------------------------------------------------\nMesa del rival actualizada sin cartas nuevas ==> ', rivalTable);
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

async function removeDeadCardsFromTables(gameId, playerTable, rivalTable) {
  const cleanTable = (table) => table.filter(card => card.alive !== false);

  const updatedPlayerTable = cleanTable(playerTable);
  const updatedRivalTable = cleanTable(rivalTable);

  await Game.updateOne(
    { _id: gameId },
    {
      $set: {
        playerTable: updatedPlayerTable,
        rivalTable: updatedRivalTable,
      }
    }
  );
}

async function checkForGameOver(game) {
  if (game.playerHp <= 0 || game.rivalHp <= 0) {
    const winner = game.playerHp > 0 ? 'player' : 'rival';
    await Game.updateOne({ _id: game._id }, { $set: { winner } });

    const player = await Player.findOne({ uid: game.playerId });
    if (player) {
      let expToAdd = winner === 'player' ? 200 : 100;
      let newProgress = (player.player_level_progress || 0) + expToAdd;
      let newLevel = player.player_level || 0;

      let leveledUp = false;

      if (newProgress >= 1000) {
        const levelsToAdd = Math.floor(newProgress / 1000);
        newLevel += levelsToAdd;
        newProgress = newProgress % 1000;
        leveledUp = true;
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

      // Solo actualiza el pase de batalla si subió de nivel
      if (leveledUp) {
        await updateBattlePass(game.playerId);
      }
    }

    return true; // El juego ha terminado
  }

  return false; // El juego sigue activo
}

module.exports = { nextTurn, drawCard, checkForGameOver, removeDeadCardsFromTables };
