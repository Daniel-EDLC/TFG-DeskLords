const Game = require('../models/Game');

async function sendUsedCardResponse(gameId, usedCard, req) {
  const updatedGame = await Game.findById(gameId);

  return req.response.success({
    gameId,
    usedCards: usedCard,
    turn: {
      number: updatedGame.currentTurn,
      whose: "user",
      phase: "hand"
    },
    user: {
      playerAvatar: updatedGame.playerAvatar,
      playerDisplayName: updatedGame.playerDisplayName,
      hand: updatedGame.playerHand,
      pending_deck: updatedGame.playerPendingDeck.length,
      table: updatedGame.playerTable,
      health: updatedGame.playerHp,
      mana: updatedGame.playerMana
    },
    rival: {
      rivalAvatar: updatedGame.rivalAvatar,
      rivalDisplayName: updatedGame.rivalDisplayName,
      hand: updatedGame.rivalHand.length,
      table: updatedGame.rivalTable,
      pending_deck: updatedGame.rivalPendingDeck.length,
      health: updatedGame.rivalHp,
      mana: updatedGame.rivalMana
    }
  });
}

async function handleCreatureCard(game, usedCard, req, res) {
  try {
    await Game.updateOne(
      { _id: game._id },
      {
        $push: { playerTable: usedCard },
        $pull: { playerHand: { _id: usedCard._id } },
        $inc: { playerMana: -usedCard.cost }
      }
    );

    const updatedGame = await Game.findById(game._id);
    const playerTableMarked = markNewCards(updatedGame.playerTable, [usedCard._id.toString()]);

    await Game.updateOne(
      { _id: game._id },
      { $set: { playerTable: playerTableMarked } }
    );

    return sendUsedCardResponse(game._id, usedCard, req);
  } catch (error) {
    return req.response.error('Error al usar la carta de criatura: ' + error.message);
  }
}

async function handleEquipementCard(game, usedCard, target, req, res) {
  try {
    if (!target) return req.response.error('Target de equipamiento no encontrado');

    const isRivalTarget = game.rivalTable.some(card => card._id.equals(target._id));
    const tableKey = isRivalTarget ? 'rivalTable' : 'playerTable';

    const newAtk = (target.atk || 0) + (usedCard.atk || 0);
    const newHp = (target.hp || 0) + (usedCard.hp || 0);

    usedCard.target = target;

    await Game.bulkWrite([
      // 1. Actualizar stats y agregar el equipamiento al objetivo (jugador o enemigo)
      {
        updateOne: {
          filter: { _id: game._id, [`${tableKey}._id`]: target._id },
          update: {
            $set: {
              [`${tableKey}.$.atk`]: newAtk,
              [`${tableKey}.$.hp`]: newHp
            },
            $push: {
              [`${tableKey}.$.equipements`]: usedCard
            }
          }
        }
      },
      // 2. Quitar la carta de la mano y restar maná
      {
        updateOne: {
          filter: { _id: game._id },
          update: {
            $pull: { playerHand: { _id: usedCard._id } },
            $inc: { playerMana: -usedCard.cost }
          }
        }
      }
    ]);

    // 3. Recargar y marcar la tabla con la carta/equipamiento usado
    const updatedGame = await Game.findById(game._id);

    // 4. Marcar nuevas cartas dependiendo de a quién se aplicó
    const markedTable = isRivalTarget
      ? markNewCards(updatedGame.rivalTable, [usedCard._id.toString()])
      : markNewCards(updatedGame.playerTable, [usedCard._id.toString()]);

    await Game.updateOne(
      { _id: game._id },
      { $set: { [tableKey]: markedTable } }
    );

    return sendUsedCardResponse(game._id, usedCard, req);

  } catch (error) {
    return req.response.error('Error al usar la carta de equipamiento: ' + error.message);
  }
}

async function handleSpellCard(game, usedCard, target, req, res) {
  if (!target) return req.response.error('Objetivo de hechizo no válido');

  const gameId = game._id;
  const targetIdStr = target._id.toString();

  const isRivalTarget = game.rivalTable.some(c => c._id.toString() === targetIdStr);
  const tableKey = isRivalTarget ? 'rivalTable' : 'playerTable';

  switch (usedCard.effect) {
    case 'protect_one': {
      usedCard.target = target;

      await Game.bulkWrite([
        {
          updateOne: {
            filter: { _id: gameId, [`${tableKey}._id`]: target._id },
            update: {
              $set: { [`${tableKey}.$.temporaryAbilities`]: 'invulnerable' },
              $push: { [`${tableKey}.$.equipements`]: usedCard }
            }
          }
        },
        {
          updateOne: {
            filter: { _id: gameId },
            update: {
              $pull: { playerHand: { _id: usedCard._id } },
              $inc: { playerMana: -usedCard.cost }
            }
          }
        }
      ]);

      const updatedGame = await Game.findById(gameId);
      const markedTable = isRivalTarget
        ? markNewCards(updatedGame.rivalTable, [usedCard._id.toString()])
        : markNewCards(updatedGame.playerTable, [usedCard._id.toString()]);

      await Game.updateOne(
        { _id: gameId },
        { $set: { [tableKey]: markedTable } }
      );

      return sendUsedCardResponse(gameId, usedCard, req);
    }

    case 'kill': {
      usedCard.target = target;

      await Game.bulkWrite([
        {
          updateOne: {
            filter: { _id: gameId, [`${tableKey}._id`]: target._id },
            update: {
              $set: { [`${tableKey}.$.alive`]: false },
              $push: { [`${tableKey}.$.equipements`]: usedCard }
            }
          }
        },
        {
          updateOne: {
            filter: { _id: gameId },
            update: {
              $pull: { playerHand: { _id: usedCard._id } },
              $inc: { playerMana: -usedCard.cost }
            }
          }
        }
      ]);

      const updatedGame = await Game.findById(gameId);
      const playerTableMarked = markNewCards(updatedGame.playerTable, [usedCard._id.toString()]);
      const rivalTableMarked = markNewCards(updatedGame.rivalTable, [usedCard._id.toString()]);

      await Game.updateOne(
        { _id: gameId },
        {
          $set: {
            playerTable: playerTableMarked,
            rivalTable: rivalTableMarked
          }
        }
      );

      return sendUsedCardResponse(gameId, usedCard, req);
    }

    default:
      return req.response.error('Efecto de hechizo no soportado');
  }
}


function markNewCards(table, usedCardIds = []) {
  return table.map(card => {
    const cardData = card.toObject?.() || card;
    const cardIdStr = cardData._id.toString();

    return {
      ...cardData,
      equipements: mapEquipements(cardData.equipements, usedCardIds),
      new: usedCardIds.includes(cardIdStr)
    };
  });
}

function mapEquipements(equipements, usedCardIds) {
  return (equipements || []).map(eq => {
    const eqData = eq.toObject?.() || eq;
    const eqIdStr = eqData._id.toString();

    return {
      ...eqData,
      new: usedCardIds.includes(eqIdStr)
    };
  });
}

async function changeCardsPositionToWaiting(game) {
  const gameUpdated = await Game.findById(game._id);
  if (!gameUpdated) {
    throw new Error('Game not found');
  }

  const updatedPlayerTable = gameUpdated.playerTable.map(card => ({
    ...card.toObject?.() || card,
    position: 'waiting'
  }));
  const updatedRivalTable = gameUpdated.rivalTable.map(card => ({
    ...card.toObject?.() || card,
    position: 'waiting'
  }));
  await Game.updateOne(
    { _id: game._id },
    {
      $set: {
        playerTable: updatedPlayerTable,
        rivalTable: updatedRivalTable
      }
    }
  );
}

module.exports = {
  sendUsedCardResponse,
  handleCreatureCard,
  handleEquipementCard,
  handleSpellCard,
  markNewCards,
  changeCardsPositionToWaiting,
};