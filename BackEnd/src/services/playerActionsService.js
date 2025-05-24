const { Types } = require('mongoose');
const Game = require('../models/Game');
const Player = require('../models/Player');
const { resolverCombate, chooseDefenders } = require('./combatService');
const { nextTurn } = require('./turnService');
const { placeCardsAndAttack } = require('./IAService');

async function useCard(req, res) {
  try {
    const ObjectId = Types.ObjectId;
    const gameObjectId = new ObjectId(req.body.gameId);
    const playerObjectId = new ObjectId(req.body.playerId);

    const game = await Game.findById(gameObjectId);
    const player = await Player.findById(playerObjectId);

    if (!player) return req.response.error('Jugador no encontrado');
    if (game.idPlayer !== player._id.toString()) return req.response.error('El id del jugador no coincide con el de la partida');

    const usedCard = game.playerHand.find(card => card._id.toString() === req.body.cardId);
    const targetedCard = game.playerTable.find(card => card._id.toString() === req.body.action?.target?.id) ||
                         game.rivalTable.find(card => card._id.toString() === req.body.action?.target?.id);

    if (!usedCard) return req.response.error("Carta no encontrada en la mano del jugador");

    switch (usedCard.type) {
      case 'criature':
        game.playerTable.push(usedCard);
        break;
      case 'equipement':
        const equipTarget = game.playerTable.find(card => card._id.toString() === targetedCard?._id?.toString());
        if (equipTarget) equipTarget.equipment = usedCard;
        break;
      case 'spell':
        if (usedCard.effect === 'protect_one') {
          if (targetedCard) targetedCard.temporaryAbilities = "invulnerable";
        } else if (usedCard.effect === 'kill') {
          if (targetedCard) {
            game.rivalTable = game.rivalTable.filter(card => card._id.toString() !== req.body.action?.target?.id);
            game.rivalGraveyard.push(targetedCard);
          }
        }
        game.playerGraveyard = game.playerGraveyard || [];
        game.playerGraveyard.push(usedCard);
        break;
    }

    game.playerHand = game.playerHand.filter(card => card._id.toString() !== req.body.cardId);
    game.playerMana -= usedCard.cost;

    await game.save();
    return req.response.success();
  } catch (error) {
    return req.response.error(`Error al usar la carta: ${error.message}`);
  }
}

async function attack(req, res) {
  try {
    const ObjectId = Types.ObjectId;
    const gameObjectId = new ObjectId(req.body.gameId);
    const playerObjectId = new ObjectId(req.body.playerId);

    const game = await Game.findById(gameObjectId);
    const player = await Player.findById(playerObjectId);

    if (!player) return req.response.error('Jugador no encontrado');
    if (!game) return req.response.error('Partida no encontrada');
    if (game.idPlayer !== player._id.toString()) return req.response.error('El id del jugador no coincide con el de la partida');

    const attackers = req.body.cards;
    const assignments = chooseDefenders(attackers, game.rivalTable);

    const combates = assignments.map(assignment =>
      resolverCombate({
        gameId: gameObjectId,
        attacker: assignment.attacker,
        defender: assignment.defender,
        isAI: false
      })
    );

    await Promise.all(combates);
    await nextTurn({ game, isAi: true });
    await placeCardsAndAttack(game);

    return req.response.success();
  } catch (error) {
    return req.response.error(`Error al atacar: ${error.message}`);
  }
}

async function defend(req, res) {
  try {
    const ObjectId = Types.ObjectId;
    const gameObjectId = new ObjectId(req.body.gameId);
    const playerObjectId = new ObjectId(req.body.playerId);

    const game = await Game.findById(gameObjectId);
    const player = await Player.findById(playerObjectId);

    if (!player) return req.response.error('Jugador no encontrado');
    if (!game) return req.response.error('Partida no encontrada');
    if (game.idPlayer !== player._id.toString()) return req.response.error('El id del jugador no coincide con el de la partida');

    // Falta implementar lógica de defensa específica
    return req.response.success();
  } catch (error) {
    return req.response.error(`Error al defender: ${error.message}`);
  }
}

async function switchPhase(req, res) {
  try {
    const ObjectId = Types.ObjectId;
    const gameObjectId = new ObjectId(req.body.gameId);
    const playerObjectId = new ObjectId(req.body.playerId);

    const game = await Game.findById(gameObjectId);
    if (!game) return req.response.error('Partida no encontrada');

    const player = await Player.findById(playerObjectId);
    if (!player) return req.response.error('Jugador no encontrado');
    if (game.idPlayer !== player._id.toString()) return req.response.error('El id del jugador no coincide con el de la partida');
    if (game.status !== 'in-progress') return req.response.error('La partida no está en progreso');

    if (req.body.turn.phase === 'hand') {
      return req.response.success({
        turn: { phase: 'table' }
      });
    }

    return req.response.success();
  } catch (error) {
    return req.response.error(`Error al cambiar de fase: ${error.message}`);
  }
}


module.exports = { useCard, attack, defend, switchPhase };
