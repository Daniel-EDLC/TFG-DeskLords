const Game = require('../models/Game');
const Player = require('../models/Player');
const { resolverCombate, chooseDefenders } = require('./combatService');
const { nextTurn, drawCard, checkForGameOver, removeDeadCardsFromTables } = require('./turnService');
const { placeCards, changeCardsPositionToAttack } = require('./IAService');
const { handleCreatureCard, handleEquipementCard, handleSpellCard, changeCardsPositionToWaiting } = require('../utils/cardUtils');

async function useCard(req, res) {
  try {
    const { gameId, playerId, cardId, target } = req.body;
    const game = await Game.findById(gameId);
    const player = await Player.findOne({ uid: playerId });

    if (!player) return req.response.error('Jugador no encontrado');
    if (game.playerId !== player.uid) return req.response.error('El id del jugador no coincide con el de la partida');

    try {
      await removeDeadCardsFromTables(gameId, game.playerTable, game.rivalTable);
    } catch (error) {
      return req.response.error(`Error al eliminar cartas muertas: ${error.message}`);
    }

    const usedCard = game.playerHand.find(card => card._id.toString() === cardId);
    const targetedCard = [...game.playerTable, ...game.rivalTable]
      .find(card => card._id.toString() === target?.id);

    if (!usedCard) return req.response.error('Carta no encontrada en la mano del jugador');

    switch (usedCard.type) {
      case 'creature':
        return handleCreatureCard(game, usedCard, req, res);
      case 'equipement':
        return handleEquipementCard(game, usedCard, targetedCard, req, res);
      case 'spell':
        return handleSpellCard(game, usedCard, targetedCard, req, res);
      default:
        return req.response.error('Tipo de carta no soportado');
    }
  } catch (error) {
    return req.response.error(`Error al usar la carta: ${error.message}`);
  }
}

async function attack(req, res) {
  try {
    const gameId = req.body.gameId;

    const game = await Game.findById(gameId);
    const player = await Player.findOne({ uid: req.body.playerId });

    if (!player) return req.response.error('Jugador no encontrado');
    if (!game) return req.response.error('Partida no encontrada');
    if (game.playerId !== player.uid) return req.response.error('El id del jugador no coincide con el de la partida');

    const cards = req.body.cards;

    const attackers = await Promise.all(
      cards.map(async cardObj => {
        const card = game.playerTable.find(c => c._id.toString() === cardObj.id);
        if (!card) throw new Error(`Carta atacante no encontrada: ${cardObj.id}`);
        return card;
      })
    );

    const assignments = chooseDefenders(attackers, game.rivalTable);

    try {
      await resolverCombate({
        gameId: gameId,
        assignments: assignments,
        isAI: false
      });
    } catch (error) {
      return req.response.error(`Error al resolver combates: ${error.message}`);
    }

    const updatedGameResponse1 = await Game.findById(gameId);

    const resultWinner = await checkForGameOver(updatedGameResponse1);

    if (resultWinner) {

      const finishedGame = await Game.findById(gameId);
      
      return req.response.success({
        action1: {
          turn: {
            number: finishedGame.currentTurn,
            whose: "player",
            phase: "defense"
          },
          battle_result: assignments.map(a => ({
            attacker: a.attacker._id,
            defender: a.defender === "player" ? "player" : a.defender._id,
          })),
          user: {
            table: finishedGame.playerTable,
            health: finishedGame.playerHp,
          },
          rival: {
            hand: finishedGame.rivalHand.length,
            table: finishedGame.rivalTable,
            pending_deck: finishedGame.rivalPendingDeck.length,
            health: finishedGame.rivalHp,
            mana: finishedGame.rivalMana
          }
        },
        gameId: req.body.gameId,
        gameOver: true,
        winner: finishedGame.winner
      });
    }

    // Action 1 response
    const action1Response = {
      turn: {
        number: updatedGameResponse1.currentTurn,
        whose: "player",
        phase: "defense"
      },
      battle_result: assignments.map(a => ({
        attacker: a.attacker._id,
        defender: a.defender === "player" ? "player" : a.defender._id,
      })),
      user: {
        table: updatedGameResponse1.playerTable,
        health: updatedGameResponse1.playerHp,
      },
      rival: {
        hand: updatedGameResponse1.rivalHand.length,
        table: updatedGameResponse1.rivalTable,
        pending_deck: updatedGameResponse1.rivalPendingDeck.length,
        health: updatedGameResponse1.rivalHp,
        mana: updatedGameResponse1.rivalMana
      }
    }

    try {
      await nextTurn({ game: updatedGameResponse1 });
    } catch (error) {
      return req.response.error(`Error al pasar al siguiente turno: ${error.message}`);
    }

    const updatedGameNextTurn = await Game.findById(gameId);

    try {
      await drawCard({ game: updatedGameNextTurn, isAI: true });
    } catch (error) {
      return req.response.error(`Error al robar carta: ${error.message}`);
    }

    const updatedGameAfterDrawing = await Game.findById(gameId);

    let usedCards = [];

    try {
      usedCards = await placeCards(updatedGameAfterDrawing);
    } catch (error) {
      return req.response.error(`Error al colocar cartas y atacar: ${error.message}`);
    }

    const updatedGameResponse2 = await Game.findById(gameId);

    // action 2 response
    const action2Response = {
      usedCards: usedCards,
      turn: {
        number: updatedGameResponse2.currentTurn,
        whose: "rival",
        phase: "hand"
      },
      user: {
        hand: updatedGameResponse2.playerHand,
        table: updatedGameResponse2.playerTable,
        pending_deck: updatedGameResponse2.playerPendingDeck.length,
        health: updatedGameResponse2.playerHp,
        mana: updatedGameResponse2.playerMana
      },
      rival: {
        hand: updatedGameResponse2.rivalHand.length,
        table: updatedGameResponse2.rivalTable,
        pending_deck: updatedGameResponse2.rivalPendingDeck.length,
        health: updatedGameResponse2.rivalHp,
        mana: updatedGameResponse2.rivalMana
      }
    }

    try {
      await removeDeadCardsFromTables(gameId, updatedGameResponse2.playerTable, updatedGameResponse2.rivalTable);
    } catch (error) {
      return req.response.error(`Error al eliminar cartas muertas de las mesas: ${error.message}`);
    }

    const updatedGameAfterRemovingDeadCards = await Game.findById(gameId);

    try {
      if (updatedGameAfterRemovingDeadCards.rivalTable.length > 0) {
        // console.log('\n----------------------------------------------------------\nCambiando posición de cartas a ataque (llamada a changeCardsPositionToAttack)');
        await changeCardsPositionToAttack(updatedGameAfterRemovingDeadCards);
      }
    } catch (error) {
      return req.response.error(`Error al cambiar posición de cartas a ataque: ${error.message}`);
    }

    const updatedGameResponse3 = await Game.findById(gameId);

    return req.response.success({
      gameId: req.body.gameId,
      battle: attackers.length > 0,
      action1: action1Response,
      action2: action2Response,
      action3: {
        turn: {
          number: updatedGameResponse3.currentTurn,
          whose: "rival",
          phase: "attack"
        },
        rival: {
          hand: updatedGameResponse3.rivalHand.length,
          table: updatedGameResponse3.rivalTable,
          pending_deck: updatedGameResponse3.rivalPendingDeck.length,
          health: updatedGameResponse3.rivalHp,
          mana: updatedGameResponse3.rivalMana
        },
        user: {
          hand: updatedGameResponse3.playerHand,
          table: updatedGameResponse3.playerTable,
          pending_deck: updatedGameResponse3.playerPendingDeck.length,
          health: updatedGameResponse3.playerHp,
          mana: updatedGameResponse3.playerMana
        }
      }
    });
  } catch (error) {
    return req.response.error(`Error al atacar: ${error.message}`);
  }
}

async function defend(req, res) {
  try {
    const gameId = req.body.gameId;

    const game = await Game.findById(gameId);
    const player = await Player.findOne({ uid: req.body.playerId });

    if (!player) return req.response.error('Jugador no encontrado');
    if (!game) return req.response.error('Partida no encontrada');
    if (game.playerId !== player.uid) return req.response.error('El id del jugador no coincide con el de la partida');

    try {
      await removeDeadCardsFromTables(gameId, game.playerTable, game.rivalTable);
    } catch (error) {
      return req.response.error(`Error al eliminar cartas muertas de las mesas: ${error.message}`);
    }

    const combats = [];
    for (const combat of req.body.battles) {
      combats.push({
        attacker: combat.atacanteId,
        defender: combat.defensorId
      });
    }

    try {
      await resolverCombate({
        gameId: gameId,
        assignments: combats,
        isAI: true
      });
    } catch (error) {
      return req.response.error(`Error al resolver combates: ${error.message}`);
    }

    const updatedGame = await Game.findById(gameId);

    const resultWinner = await checkForGameOver(updatedGame);

    if (resultWinner) {
      return req.response.success({
        battle: combats.map(combat => ({
          attacker: combat.attacker,
          defender: combat.defender
        })),
        turn: {
          number: updatedGame.currentTurn,
          whose: "user",
          phase: "hand"
        },
        user: {
          hand: updatedGame.playerHand,
          table: updatedGame.playerTable,
          pending_deck: updatedGame.playerPendingDeck.length,
          health: updatedGame.playerHp,
          mana: updatedGame.playerMana
        },
        rival: {
          hand: updatedGame.rivalHand.length,
          table: updatedGame.rivalTable,
          pending_deck: updatedGame.rivalPendingDeck.length,
          health: updatedGame.rivalHp,
          mana: updatedGame.rivalMana
        },
        gameId: req.body.gameId,
        gameOver: true,
        winner: updatedGame.winner
      });
    }

    try {
      await nextTurn({ game: updatedGame });
    } catch (error) {
      return req.response.error(`Error al pasar al siguiente turno: ${error.message}`);
    }

    const updatedGameNextTurn = await Game.findById(gameId);

    try {
      await drawCard({ game: updatedGameNextTurn, isAI: false });
    } catch (error) {
      return req.response.error(`Error al robar carta: ${error.message}`);
    }

    const updatedGameAfterDrawing = await Game.findById(gameId);

    try {
      await changeCardsPositionToWaiting(updatedGameAfterDrawing);
    } catch (error) {
      return req.response.error(`Error al cambiar posición de cartas a 'waiting': ${error.message}`);
    }

    const updatedGameAfterChangingPositions = await Game.findById(gameId);

    return req.response.success({
      gameId: req.body.gameId,
      battle: combats.map(combat => ({
        attacker: combat.attacker,
        defender: combat.defender
      })),
      turn: {
        number: updatedGameAfterChangingPositions.currentTurn,
        whose: "user",
        phase: "hand"
      },
      user: {
        hand: updatedGameAfterChangingPositions.playerHand,
        table: updatedGameAfterChangingPositions.playerTable,
        pending_deck: updatedGameAfterChangingPositions.playerPendingDeck.length,
        health: updatedGameAfterChangingPositions.playerHp,
        mana: updatedGameAfterChangingPositions.playerMana
      },
      rival: {
        hand: updatedGameAfterChangingPositions.rivalHand.length,
        table: updatedGameAfterChangingPositions.rivalTable,
        pending_deck: updatedGameAfterChangingPositions.rivalPendingDeck.length,
        health: updatedGameAfterChangingPositions.rivalHp,
        mana: updatedGameAfterChangingPositions.rivalMana
      }
    });
  } catch (error) {
    return req.response.error(`Error al defender: ${error.message}`);
  }
}

async function switchPhase(req, res) {
  try {
    const gameId = req.body.gameId;

    const game = await Game.findById(gameId);
    if (!game) return req.response.error('Partida no encontrada');

    const player = await Player.findOne({ uid: req.body.playerId });

    if (!player) return req.response.error('Jugador no encontrado');

    if (game.playerId !== player.uid) return req.response.error('El id del jugador no coincide con el de la partida');

    if (game.status !== 'in-progress') return req.response.error('La partida no está en progreso');

    try {
      await removeDeadCardsFromTables(gameId, game.playerTable, game.rivalTable);
    } catch (error) {
      return req.response.error(`Error al eliminar cartas muertas de las mesas: ${error.message}`);
    }

    if (req.body.turn.phase === 'hand') {
      // Mover cartas muertas de la mesa rival al graveyard rival antes de cambiar de fase
      const deadRivalCards = game.rivalTable.filter(card => card.alive === false);
      if (deadRivalCards.length > 0) {
        await Game.updateOne(
          { _id: gameId },
          {
            $pull: { rivalTable: { alive: false } },
            $push: { rivalGraveyard: { $each: deadRivalCards } }
          }
        );
      }
      // Mover cartas muertas de la mesa del player al graveyard del player antes de cambiar de fase
      const deadPlayerCards = game.playerTable.filter(card => card.alive === false);
      if (deadPlayerCards.length > 0) {
        await Game.updateOne(
          { _id: gameId },
          {
            $pull: { playerTable: { alive: false } },
            $push: { playerGraveyard: { $each: deadPlayerCards } }
          }
        );
      }

      return req.response.success({
        gameId: req.body.gameId,
        turn: {
          phase: 'table'
        }
      });
    }
  } catch (error) {
    return req.response.error(`Error al cambiar de fase: ${error.message}`);
  }
}


module.exports = { useCard, attack, defend, switchPhase };
