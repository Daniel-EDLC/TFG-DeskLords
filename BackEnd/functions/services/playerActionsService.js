const Game = require('../models/Game');
const Player = require('../models/Player');
const { resolverCombate, chooseDefenders } = require('./combatService');
const { nextTurn, drawCard } = require('./turnService');
const { placeCardsAndAttack } = require('./IAService');

async function useCard(req, res) {
  try {
    const gameId = req.body.gameId;

    const game = await Game.findById(gameId);
    const player = await Player.findOne({ uid: req.body.playerId });

    if (!player) return req.response.error('Jugador no encontrado');
    if (game.playerId !== player.uid) return req.response.error('El id del jugador no coincide con el de la partida');

    console.log('game', game);
    const usedCard = game.playerHand.find(card => card._id.toString() === req.body.cardId);
    const targetedCard = game.playerTable.find(card => card._id.toString() === req.body.action?.target?.id) ||
      game.rivalTable.find(card => card._id.toString() === req.body.action?.target?.id);

    if (!usedCard) return req.response.error("Carta no encontrada en la mano del jugador");

    switch (usedCard.type) {
      case 'creature': {
        // Añadir criatura a la mesa del jugador y quitar de la mano
        await Game.updateOne(
          { _id: gameId },
          {
            $push: { playerTable: usedCard },
            $pull: { playerHand: { _id: usedCard._id } },
            $inc: { playerMana: -usedCard.cost }
          }
        );

        // Leer el estado actualizado del juego
        const updatedGame = await Game.findById(gameId);

        // Marcar solo la última carta añadida como new: true, el resto no
        const playerTableupdated = updatedGame.playerTable.map((card, idx, arr) => {
          if (idx === arr.length - 1) {
            return { ...card.toObject(), new: true };
          } else {
            const { new: _omit, ...rest } = card.toObject();
            return rest;
          }
        });

        return req.response.success({
          gameId: req.body.gameId,
          action_result: {
            type: 'use',
            card: usedCard
          },
          turn: {
            number: updatedGame.currentTurn,
            whose: "user",
            phase: "hand"
          },
          user: {
            hand: updatedGame.playerHand,
            table: playerTableupdated,
            mana: updatedGame.playerMana
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
            { _id: gameId, 'playerTable._id': equipTarget._id },
            {
              $set: { 'playerTable.$.equipements': usedCard },
              $pull: { playerHand: { _id: usedCard._id } },
              $inc: { playerMana: -usedCard.cost }
            }
          );

          const updatedGame = await Game.findById(gameId);

          // Marcar solo el último equipement añadido como new: true, el resto no
          const playerTableupdated = updatedGame.playerTable.map(card => {
            if (card._id.toString() === equipTarget._id.toString()) {
              // Si la carta es la objetivo, procesar su array de equipements
              const equipements = (card.equipements || []).map((eq, idx, arr) => {
                if (idx === arr.length - 1) {
                  return { ...eq.toObject?.() || eq, new: true };
                } else {
                  const { new: _omit, ...rest } = eq.toObject?.() || eq;
                  return rest;
                }
              });
              return { ...card.toObject(), equipements };
            } else {
              return card.toObject();
            }
          });

          return req.response.success({
            gameId: req.body.gameId,
            action_result: {
              type: 'use',
              card: usedCard
            },
            turn: {
              number: updatedGame.currentTurn,
              whose: "user",
              phase: "hand"
            },
            user: {
              hand: updatedGame.playerHand,
              table: playerTableupdated,
              mana: updatedGame.playerMana
            }
          });
        } else {
          return req.response.error('Target no encontrado');
        }
      }
      case 'spell': {
        // Resolver efectos de hechizo
        if (usedCard.effect === 'protect_one') {
          if (targetedCard) {
            // Proteger carta aliada
            usedCard.target = targetedCard;
            await Game.updateOne(
              { _id: gameId, 'playerTable._id': targetedCard._id },
              {
                $set: { 'playerTable.$.temporaryAbilities': 'invulnerable' },
                $pull: { playerHand: { _id: usedCard._id } },
                $inc: { playerMana: -usedCard.cost },
                $push: { playerGraveyard: usedCard }
              }
            );

            const updatedGame = await Game.findById(gameId);

            return req.response.success({
              gameId: req.body.gameId,
              action_result: {
                type: 'use',
                card: usedCard
              },
              turn: {
                number: updatedGame.currentTurn,
                whose: "user",
                phase: "hand"
              },
              user: {
                hand: updatedGame.playerHand,
                table: updatedGame.playerTable,
                mana: updatedGame.playerMana
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
              { _id: gameId },
              {
                $pull: { rivalTable: { _id: targetedCard._id }, playerHand: { _id: usedCard._id } },
                $push: { rivalGraveyard: targetedCard, playerGraveyard: usedCard },
                $inc: { playerMana: -usedCard.cost }
              }
            );
          } else {
            return req.response.error('Objetivo de hechizo no válido');
          }

          const updatedGame = await Game.findById(gameId);

          return req.response.success({
            gameId: req.body.gameId,
            action_result: {
              type: 'use',
              card: usedCard
            },
            turn: {
              number: updatedGame.currentTurn,
              whose: "user",
              phase: "hand"
            },
            user: {
              hand: updatedGame.playerHand,
              table: updatedGame.playerTable,
              mana: updatedGame.playerMana
            },
            rival: {
              table: updatedGame.rivalTable,
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
    const gameId = req.body.gameId;

    const game = await Game.findById(gameId);
    const player = await Player.findOne({ uid: req.body.playerId });

    if (!player) return req.response.error('Jugador no encontrado');
    if (!game) return req.response.error('Partida no encontrada');
    if (game.idPlayer !== player._id.toString()) return req.response.error('El id del jugador no coincide con el de la partida');

    const attackers = req.body.cards;
    const assignments = chooseDefenders(attackers, game.rivalTable);

    const combates = assignments.map(assignment =>
      resolverCombate({
        gameId: gameId,
        attacker: assignment.attacker,
        defender: assignment.defender,
        isAI: false
      })
    );

    await Promise.all(combates);

    const updatedGameResponse1 = await Game.findById(gameId);

    // Action 1 response
    const action1Response = {
      turn: {
        number: updatedGameResponse1.currentTurn,
        whose: "player",
        phase: "defense"
      },
      battle_result: assignments.map(a => ({
        attacker: a.attacker._id.toString(),
        defender: a.defender === "player" ? "player" : a.defender._id.toString(),
      })),
      user: {
        table: updatedGameResponse1.playerTable,
        pending_deck: updatedGameResponse1.playerPendingDeck,
        health: updatedGameResponse1.playerHp,
        mana: updatedGameResponse1.playerMana // En principio no es necesario
      },
      rival: {
        hand: updatedGameResponse1.rivalHand,
        table: updatedGameResponse1.rivalTable,
        pending_deck: updatedGameResponse1.rivalPendingDeck,
        health: updatedGameResponse1.rivalHp,
        mana: updatedGameResponse1.rivalMana
      }
    }

    // action de robar carta
    await nextTurn({ game, isAi: true });

    await drawCard({ game, isAI: true });

    const result = await placeCardsAndAttack(game);

    const updatedGameResponse2y3 = await Game.findById(gameId);

    // action 2 response
    const action2Response = {
      turn: {
        number: updatedGameResponse2y3.currentTurn,
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
      { _id: gameId },
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
          number: updatedGameResponse2y3.currentTurn,
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
    const gameId = req.body.gameId;

    const game = await Game.findById(gameId);
    const player = await Player.findOne({ uid: req.body.playerId });

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
        gameId: gameId,
        attacker: combat.attacker,
        defender: combat.defender,
        isAI: true
      })
    );

    await Promise.all(resolvedCombats);

    const updatedGame = await Game.findById(gameId);

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
        table: updatedGame.playerTable,
        pending_deck: updatedGame.playerPendingDeck,
        health: updatedGame.playerHp,
        mana: updatedGame.playerMana
      },
      rival: {
        hand: updatedGame.rivalHand,
        table: updatedGame.rivalTable,
        pending_deck: updatedGame.rivalPendingDeck,
        health: updatedGame.rivalHp,
        mana: updatedGame.rivalMana
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
