const { Types } = require('mongoose');
const Game = require('../models/Game');
const Player = require('../models/Player');
const { resolverCombate, chooseDefenders } = require('./combatService');
const { nextTurn, drawCard } = require('./turnService');
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
      case 'criature': {
        // Añadir criatura a la mesa del jugador y quitar de la mano
        await Game.updateOne(
          { _id: gameObjectId },
          {
            $push: { playerTable: usedCard },
            $pull: { playerHand: { _id: usedCard._id } },
            $inc: { playerMana: -usedCard.cost }
          }
        );

        return req.response.success({
          action_result: {
            type: 'use',
            card: usedCard
          },
          user: {
            hand: game.playerHand,
            table: game.playerTable,
            mana: game.playerMana
          }
        });
      }
      case 'equipement': {
        // Equipar carta a objetivo
        const equipTarget = game.playerTable.find(card => card._id.toString() === targetedCard?._id?.toString());
        if (equipTarget) {
          // Usamos positional operator para actualizar el equipo de la carta objetivo
          usedCard.target = equipTarget;
          await Game.updateOne(
            { _id: gameObjectId, 'playerTable._id': equipTarget._id },
            {
              $set: { 'playerTable.$.equipements': usedCard },
              $pull: { playerHand: { _id: usedCard._id } },
              $inc: { playerMana: -usedCard.cost }
            }
          );

          return req.response.success({
            gameId: req.body.gameId,
            action_result: {
              type: 'use',
              card: usedCard
            },
            user: {
              hand: game.playerHand,
              table: game.playerTable,
              mana: game.playerMana
            }
          });
        } else {
          return req.response.error('Objetivo de equipamiento no válido');
        }
      }
      case 'spell': {
        // Resolver efectos de hechizo
        if (usedCard.effect === 'protect_one') {
          if (targetedCard) {
            // Proteger carta aliada
            usedCard.target = targetedCard;
            await Game.updateOne(
              { _id: gameObjectId, 'playerTable._id': targetedCard._id },
              {
                $set: { 'playerTable.$.temporaryAbilities': 'invulnerable' },
                $pull: { playerHand: { _id: usedCard._id } },
                $inc: { playerMana: -usedCard.cost },
                $push: { playerGraveyard: usedCard }
              }
            );

            return req.response.success({
              gameId: req.body.gameId,
              action_result: {
                type: 'use',
                card: usedCard
              },
              user: {
                hand: game.playerHand,
                table: game.playerTable,
                mana: game.playerMana
              }
            });

          } else {
            return req.response.error('Objetivo de hechizo no válido');
          }
        } else if (usedCard.effect === 'kill') {
          if (targetedCard) {
            // Eliminar carta rival y pasarla a cementerio
            usedCard.target = targetedCard;
            await Game.updateOne(
              { _id: gameObjectId },
              {
                $pull: { rivalTable: { _id: targetedCard._id }, playerHand: { _id: usedCard._id } },
                $push: { rivalGraveyard: targetedCard, playerGraveyard: usedCard },
                $inc: { playerMana: -usedCard.cost }
              }
            );
          } else {
            return req.response.error('Objetivo de hechizo no válido');
          }

          return req.response.success({
            gameId: req.body.gameId,
            action_result: {
              type: 'use',
              card: usedCard
            },
            user: {
              hand: game.playerHand,
              table: game.playerTable,
              mana: game.playerMana
            },
            rival: {
              table: game.rivalTable,
            }
          });
        }
      }
      default:
        return req.response.error('Tipo de carta no soportado');
    }
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

    // Action 1 response
    const action1Response = {
      turn: {
        number: game.currentTurn,
        whose: "player",
        phase: "defense"
      },
      battle_result: assignments.map(a => ({
        attacker: a.attacker._id.toString(),
        defender: a.defender === "player" ? "player" : a.defender._id.toString(),
      })),
      user: {
        table: game.playerTable,
        pending_deck: game.playerPendingDeck,
        health: game.playerHp,
        mana: game.playerMana // En principio no es necesario
      },
      rival: {
        hand: game.rivalHand,
        table: game.rivalTable,
        pending_deck: game.rivalPendingDeck,
        health: game.rivalHp,
        mana: game.rivalMana
      }
    }

    // action de robar carta
    await nextTurn({ game, isAi: true });

    await drawCard({ game, isAI: true });

    const result = await placeCardsAndAttack(game);

    // action 2 response
    const action2Response = {
      turn: {
        number: game.currentTurn,
        whose: "rival",
        phase: "hand"
      },
      action_result: [
        result.actionSpell,
        result.actionEquipement,
        ...result.rivalTable
      ],
      rival: {
        hand: result.rivalHand,
        table: result.rivalTable,
        pending_deck: result.rivalPendingDeck,
        health: result.rivalHp,
        mana: result.rivalMana
      }
    }

    await Game.updateOne(
      { _id: gameObjectId },
      {
        $set: {
          'rivalTable.$[].position': 'attack'
        }
      }
    )

    return req.response.success({
      gameId: req.body.gameId,
      action1: action1Response ? action1Response : {},
      action2: action2Response,
      action3: {
        turn: {
          number: game.currentTurn,
          whose: "rival",
          phase: "attack"
        },
        rival: {
          hand: result.rivalHand,
          table: result.rivalTable,
          pending_deck: result.rivalPendingDeck,
          health: result.rivalHp,
          mana: result.rivalMana
        }
      }
    });
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

    const combats = [];
    for (const combat of req.body.battle) {
      const attacker = game.rivalTable.find(card => card._id.toString() === combat.attacker);
      if (!attacker) return req.response.error(`Atacante no encontrado: ${combat.attacker}`);

      const defender = combat.defender === "player" ? "player" : game.playerTable.find(card => card._id.toString() === combat.defender);
      if (!defender) return req.response.error(`Defensor no encontrado: ${combat.defender}`);

      combats.push({ attacker, defender });
    }

    const resolvedCombats = combats.map(combat =>
      resolverCombate({
        gameId: gameObjectId,
        attacker: combat.attacker,
        defender: combat.defender,
        isAI: true
      })
    );

    await Promise.all(resolvedCombats);


    return req.response.success({
      gameId: req.body.gameId,
      battle: combats.map(combat => ({
        attacker: combat.attacker,
        defender: combat.defender
      })),
      turn: {
        number: 2,
        whose: "user",
        phase: "hand"
      },
      user: {
        table: game.playerTable,
        pending_deck: game.playerPendingDeck,
        health: game.playerHp,
        mana: game.playerMana
      },
      rival: {
        hand: game.rivalHand,
        table: game.rivalTable,
        pending_deck: game.rivalPendingDeck,
        health: game.rivalHp,
        mana: game.rivalMana
      }
    });
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
