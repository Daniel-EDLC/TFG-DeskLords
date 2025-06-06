const Game = require('../models/Game');

async function sendUsedCardResponse(gameId, usedCard, req) {
  const updatedGame = await Game.findById(gameId);
  const userTable = markNewCards(updatedGame.playerTable);
  const rivalTable = markNewCards(updatedGame.rivalTable);

  return req.response.success({
    gameId,
    action_result: { type: 'use', card: usedCard },
    turn: {
      number: updatedGame.currentTurn,
      whose: "user",
      phase: "hand"
    },
    user: {
      hand: updatedGame.playerHand,
      pending_deck: updatedGame.playerPendingDeck.length,
      table: userTable,
      health: updatedGame.playerHp,
      mana: updatedGame.playerMana
    },
    rival: {
      hand: updatedGame.rivalHand.length,
      table: rivalTable,
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
    const playerTableMarked = markNewCards(updatedGame.playerTable);

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

    const newAtk = (target.atk || 0) + (usedCard.atk || 0);
    const newHp = (target.hp || 0) + (usedCard.hp || 0);

    usedCard.target = target;

    await Game.bulkWrite([
      // 1. Actualizar los stats y añadir el equipement
      {
        updateOne: {
          filter: { _id: game._id, 'playerTable._id': target._id },
          update: {
            $set: {
              'playerTable.$.atk': newAtk,
              'playerTable.$.hp': newHp
            },
            $push: {
              'playerTable.$.equipements': usedCard
            }
          }
        }
      },
      // 2. Quitar carta de la mano y restar maná
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
    const playerTableMarked = markNewCards(updatedGame.playerTable);

    // 4. Aplicar esa tabla marcada como parte del resultado
    await Game.updateOne(
      { _id: game._id },
      { $set: { playerTable: playerTableMarked } }
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

  switch (usedCard.effect) {
    case 'protect_one': {
      // Añadir target al usedCard por si quieres rastrearlo
      usedCard.target = target._id;

      await Game.bulkWrite([
        {
          updateOne: {
            filter: { _id: gameId, 'playerTable._id': target._id },
            update: {
              $set: { 'playerTable.$.temporaryAbilities': 'invulnerable' },
              $push: { 'playerTable.$.equipements': usedCard }
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
      const playerTableMarked = markNewCards(updatedGame.playerTable);
      await Game.updateOne(
        { _id: gameId },
        { $set: { playerTable: playerTableMarked } }
      );

      return sendUsedCardResponse(gameId, usedCard, req);
    }

    case 'kill': {
      const isRivalTarget = game.rivalTable.some(c => c._id.toString() === targetIdStr);
      const tablePath = isRivalTarget ? 'rivalTable' : 'playerTable';

      usedCard.target = target._id;

      await Game.bulkWrite([
        {
          updateOne: {
            filter: { _id: gameId, [`${tablePath}._id`]: target._id },
            update: {
              $set: { [`${tablePath}.$.alive`]: false },
              $push: { [`${tablePath}.$.equipements`]: usedCard }
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
      const playerTableMarked = markNewCards(updatedGame.playerTable);
      const rivalTableMarked = markNewCards(updatedGame.rivalTable);

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

function markNewCards(table, usedCards = [], isAi = false) {
  return table.map(card => {
    const cardData = card.toObject?.() || card;
    return {
      ...cardData,
      equipements: mapEquipements(cardData.equipements, usedCards, isAi),
      new: isAi ? usedCards.includes(cardData._id.toString()) : cardData.new || false
    };
  });
}

function mapEquipements(equipements, usedCards, isAi) {
  return (equipements || []).map(eq => {
    const eqData = eq.toObject?.() || eq;
    return {
      ...eqData,
      new: isAi ? usedCards.includes(eqData._id.toString()) : eqData.new || false
    };
  });
}

module.exports = {
  sendUsedCardResponse,
  handleCreatureCard,
  handleEquipementCard,
  handleSpellCard,
  markNewCards
};