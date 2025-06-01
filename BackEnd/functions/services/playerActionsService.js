const Game = require('../models/Game');
const Player = require('../models/Player');
const Card = require('../models/Card');
const { resolverCombate, chooseDefenders } = require('./combatService');
const { nextTurn, drawCard, checkForGameOver } = require('./turnService');
const { placeCards, changeCardsPositionToAttack } = require('./IAService');

async function useCard(req, res) {
  try {
    const gameId = req.body.gameId;

    const game = await Game.findById(gameId);
    const player = await Player.findOne({ uid: req.body.playerId });

    if (!player) return req.response.error('Jugador no encontrado');
    if (game.playerId !== player.uid) return req.response.error('El id del jugador no coincide con el de la partida');

    console.log('game', game);
    const usedCard = game.playerHand.find(card => card._id.toString() === req.body.cardId);
    const targetedCard = game.playerTable.find(card => card._id.toString() === req.body.target?.id) ||
      game.rivalTable.find(card => card._id.toString() === req.body.target?.id);

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
            pending_deck: updatedGame.playerPendingDeck.length,
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
              $push: { 'playerTable.$.equipements': usedCard },
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
              pending_deck: updatedGame.playerPendingDeck.length,
              table: playerTableupdated,
              mana: updatedGame.playerMana
            }
          });
        } else {
          return req.response.error('Target de equipamiento no encontrado');
        }
      }
      case 'spell': {
        // Resolver efectos de hechizo
        if (usedCard.effect === 'protect_one') {
          if (targetedCard) {
            // Proteger carta aliada y añadir el spell a equipements
            usedCard.target = targetedCard;
            await Game.updateOne(
              { _id: gameId, 'playerTable._id': targetedCard._id },
              {
                $set: { 'playerTable.$.temporaryAbilities': 'invulnerable' },
                $push: { 'playerTable.$.equipements': usedCard },
                $pull: { playerHand: { _id: usedCard._id } },
                $inc: { playerMana: -usedCard.cost }
              }
            );

            const updatedGame = await Game.findById(gameId);

            // Marcar solo el último spell añadido como new: true en equipements
            const playerTableupdated = updatedGame.playerTable.map(card => {
              if (card._id.toString() === targetedCard._id.toString()) {
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
                pending_deck: updatedGame.playerPendingDeck.length,
                table: playerTableupdated,
                mana: updatedGame.playerMana
              }
            });
          } else {
            return req.response.error('Target de hechizo de tipo protect no encontrado');
          }
        } else if (usedCard.effect === 'kill') {
          if (targetedCard) {
            usedCard.target = targetedCard;
            // Determinar si la carta objetivo está en la mesa del rival o del player
            if (game.rivalTable.some(card => card._id.toString() === targetedCard._id.toString())) {
              // Objetivo en la mesa del rival
              await Game.updateOne(
                { _id: gameId, 'rivalTable._id': targetedCard._id },
                {
                  $set: { 'rivalTable.$.alive': false },
                  $push: { 'rivalTable.$.equipements': usedCard },
                  $pull: { playerHand: { _id: usedCard._id } },
                  $inc: { playerMana: -usedCard.cost }
                }
              );
            } else if (game.playerTable.some(card => card._id.toString() === targetedCard._id.toString())) {
              // Objetivo en la mesa del player
              await Game.updateOne(
                { _id: gameId, 'playerTable._id': targetedCard._id },
                {
                  $set: { 'playerTable.$.alive': false },
                  $push: { 'playerTable.$.equipements': usedCard },
                  $pull: { playerHand: { _id: usedCard._id } },
                  $inc: { playerMana: -usedCard.cost }
                }
              );
            } else {
              return req.response.error('Target de hechizo de tipo kill no encontrado');
            }

            const updatedGame = await Game.findById(gameId);

            // Marcar solo el último spell añadido como new: true en equipements de la carta objetivo
            let playerTableupdated = updatedGame.playerTable;
            let rivalTableupdated = updatedGame.rivalTable;
            if (game.rivalTable.some(card => card._id.toString() === targetedCard._id.toString())) {
              rivalTableupdated = updatedGame.rivalTable.map(card => {
                if (card._id.toString() === targetedCard._id.toString()) {
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
            } else if (game.playerTable.some(card => card._id.toString() === targetedCard._id.toString())) {
              playerTableupdated = updatedGame.playerTable.map(card => {
                if (card._id.toString() === targetedCard._id.toString()) {
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
            }

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
              },
              rival: {
                table: rivalTableupdated,
              }
            });
          } else {
            return req.response.error('Objetivo de hechizo no válido');
          }
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
    if (game.playerId !== player.uid) return req.response.error('El id del jugador no coincide con el de la partida');

    const cards = req.body.cards;
    const attackers = await Promise.all(
      cards.map(async cardObj => {
        const card = await Card.findById(cardObj.id);
        if (!card) throw new Error(`Carta atacante no encontrada: ${cardObj.id}`);
        return card;
      })
    );

    const assignments = chooseDefenders(attackers, game.rivalTable);

    try {
      const combates = assignments.map(assignment =>
        resolverCombate({
          gameId: gameId,
          attacker: assignment.attacker,
          defender: assignment.defender,
          isAI: false
        })
      );

      await Promise.all(combates);
    } catch (error) {
      return req.response.error(`Error al resolver combates: ${error.message}`);
    }

    const updatedGameResponse1 = await Game.findById(gameId);

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

    // action de robar carta
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

    try {
      await placeCards(updatedGameAfterDrawing);
    } catch (error) {
      return req.response.error(`Error al colocar cartas y atacar: ${error.message}`);
    }

    const updatedGameResponse2 = await Game.findById(gameId);

    // action 2 response
    const action2Response = {
      turn: {
        number: updatedGameResponse2.currentTurn,
        whose: "rival",
        phase: "hand"
      },
      user: {
        table: updatedGameResponse2.playerTable,
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
      // Mover cartas muertas al graveyard después de crear la respuesta
      const deadCards = updatedGameResponse2.playerTable.filter(card => card.alive === false);
      if (deadCards.length > 0) {
        await Game.updateOne(
          { _id: gameId },
          {
            $pull: { playerTable: { alive: false } },
            $push: { playerGraveyard: { $each: deadCards } }
          }
        );
        // Refrescar el estado actualizado para siguientes respuestas
        Object.assign(updatedGameResponse2, await Game.findById(gameId));
      }
    } catch (error) {
      return req.response.error(`Error al mover cartas muertas al graveyard: ${error.message}`);
    }

    const updatedGameAfterPlacingCards = await Game.findById(gameId);

    try {
      if (updatedGameAfterPlacingCards.rivalTable.length > 0) {
        await changeCardsPositionToAttack(updatedGameAfterPlacingCards);
      }
    } catch (error) {
      return req.response.error(`Error al cambiar posición de cartas a ataque: ${error.message}`);
    }

    const updatedGameResponse3 = await Game.findById(gameId);

    return req.response.success({
      gameId: req.body.gameId,
      action1: action1Response ? action1Response : {},
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
          table: updatedGameResponse3.playerTable,
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

    const combats = [];
    for (const combat of req.body.battles) {
      // Buscar el atacante en la mesa del rival
      const attacker = game.rivalTable.find(card => card._id.toString() === combat.atacanteId);
      if (!attacker) return req.response.error(`Atacante no encontrado: ${combat.atacanteId}`);

      // Si el defensor es "player", lo dejamos como string, si no, buscamos la carta en la mesa del player
      let defender;
      if (combat.defensorId === "player") {
        defender = "player";
      } else {
        defender = game.playerTable.find(card => card._id.toString() === combat.defensorId);
        if (!defender) return req.response.error(`Defensor no encontrado: ${combat.defensorId}`);
      }

      // Pushear los objetos de carta ya convertidos
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
      // Cambiar el campo position de todas las cartas de la mesa del player y del rival a 'waiting'
      const updatedPlayerTable = updatedGameAfterDrawing.playerTable.map(card => ({
        ...card.toObject() || card,
        position: 'waiting'
      }));
      const updatedRivalTable = updatedGameAfterDrawing.rivalTable.map(card => ({
        ...card.toObject() || card,
        position: 'waiting'
      }));
      await Game.updateOne(
        { _id: gameId },
        {
          $set: {
            playerTable: updatedPlayerTable,
            rivalTable: updatedRivalTable
          }
        }
      );
    } catch (error) {
      return req.response.error(`Error al cambiar posición de cartas a 'waiting': ${error.message}`);
    }

    const updatedGameAfterChangingPositions = await Game.findById(gameId);

    console.log("Updated game after changing positions:", updatedGameAfterChangingPositions);

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
