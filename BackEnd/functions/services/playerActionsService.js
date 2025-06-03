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

    console.log('Game al inicio de la partida ==> ', game.playerDeck, game.rivalDeck);

    if (!player) return req.response.error('Jugador no encontrado');
    if (game.playerId !== player.uid) return req.response.error('El id del jugador no coincide con el de la partida');

    const usedCard = game.playerHand.find(card => card._id.toString() === req.body.cardId);
    console.log('\n----------------------------------------------------------\nCarta usada ==> ', usedCard);
    const targetedCard = game.playerTable.find(card => card._id.toString() === req.body.target?.id) ||
      game.rivalTable.find(card => card._id.toString() === req.body.target?.id);
    console.log('\n----------------------------------------------------------\nCarta objetivo ==> ', targetedCard);

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

        // Marcar solo la última carta añadida como new: true, el resto como new: false
        const playerTableupdated = updatedGame.playerTable.map((card, idx, arr) => {
          const base = card.toObject?.() || card;
          return {
            ...base,
            new: idx === arr.length - 1 // true solo para la última carta, false para el resto
          };
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
            health: updatedGame.playerHp,
            mana: updatedGame.playerMana
          },
          rival: {
            hand: updatedGame.rivalHand.length,
            table: updatedGame.rivalTable,
            pending_deck: updatedGame.rivalPendingDeck.length,
            health: updatedGame.rivalHp,
            mana: updatedGame.rivalMana
          }
        });
      }
      case 'equipement': {
        // Equipar carta a objetivo
        const equipTarget = game.playerTable.find(card => card._id.toString() === targetedCard?._id?.toString());
        if (equipTarget) {
          // Usamos positional operator para actualizar el equipo de la carta objetivo
          usedCard.target = equipTarget;
          const newAtk = (equipTarget.atk || 0) + (usedCard.atk || 0);
          const newHp = (equipTarget.hp || 0) + (usedCard.hp || 0);

          // 1. Actualizar stats
          await Game.updateOne(
            { _id: gameId, 'playerTable._id': equipTarget._id },
            { 
              $set: {
              'playerTable.$.atk': newAtk,
              'playerTable.$.hp': newHp
              }
            }
          );

          // 2. Añadir equipement y quitar de la mano, restar maná
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
              // Procesar su array de equipements
              const equipements = (card.equipements || []).map((eq, idx, arr) => {
                const eqBase = eq.toObject?.() || eq;
                return {
                  ...eqBase,
                  new: idx === arr.length - 1 // true solo para el último, false para el resto
                };
              });
              return { ...card.toObject?.(), equipements };
            } else {
              return card.toObject?.();
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
              health: updatedGame.playerHp,
              mana: updatedGame.playerMana
            },
            rival: {
              hand: updatedGame.rivalHand.length,
              table: updatedGame.rivalTable,
              pending_deck: updatedGame.rivalPendingDeck.length,
              health: updatedGame.rivalHp,
              mana: updatedGame.rivalMana
            }
          });
        } else {
          return req.response.error('Target de equipamiento no encontrado');
        }
      }
      case 'spell': {
        // Resolver efectos de hechizo
        if (usedCard.effect === 'protect_one') {
          console.log('\n----------------------------------------------------------\nObjetivo del hechizo encontrado ==> ', targetedCard);
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
                // Procesar su array de equipements
                const equipements = (card.equipements || []).map((eq, idx, arr) => {
                  const eqBase = eq.toObject?.() || eq;
                  return {
                    ...eqBase,
                    new: idx === arr.length - 1 // true solo para el último, false para el resto
                  };
                });
                return { ...card.toObject?.(), equipements };
              } else {
                return card.toObject?.();
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
                health: updatedGame.playerHp,
                mana: updatedGame.playerMana
              },
              rival: {
                hand: updatedGame.rivalHand.length,
                table: updatedGame.rivalTable,
                pending_deck: updatedGame.rivalPendingDeck.length,
                health: updatedGame.rivalHp,
                mana: updatedGame.rivalMana
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
              // 1. Marcar la carta como muerta
              await Game.updateOne(
                { _id: gameId, 'rivalTable._id': targetedCard._id },
                { $set: { 'rivalTable.$.alive': false } }
              );

              // 2. Añadir el equipement
              await Game.updateOne(
                { _id: gameId, 'rivalTable._id': targetedCard._id },
                { $push: { 'rivalTable.$.equipements': usedCard } }
              );

              // 3. Quitar la carta de la mano y restar maná
              await Game.updateOne(
                { _id: gameId },
                {
                  $pull: { playerHand: { _id: usedCard._id } },
                  $inc: { playerMana: -usedCard.cost }
                }
              );
            } else if (game.playerTable.some(card => card._id.toString() === targetedCard._id.toString())) {
              // Objetivo en la mesa del player
              // 1. Marcar la carta como muerta
              await Game.updateOne(
                { _id: gameId, 'playerTable._id': targetedCard._id },
                { $set: { 'playerTable.$.alive': false } }
              );

              // 2. Añadir el equipement
              await Game.updateOne(
                { _id: gameId, 'playerTable._id': targetedCard._id },
                { $push: { 'playerTable.$.equipements': usedCard } }
              );

              // 3. Quitar la carta de la mano y restar maná
              await Game.updateOne(
                { _id: gameId },
                {
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
                    const eqBase = eq.toObject?.() || eq;
                    return {
                      ...eqBase,
                      new: idx === arr.length - 1 // true solo para el último, false para el resto
                    };
                  });
                  return { ...card.toObject?.(), equipements };
                } else {
                  return card.toObject?.();
                }
              });
            } else if (game.playerTable.some(card => card._id.toString() === targetedCard._id.toString())) {
              playerTableupdated = updatedGame.playerTable.map(card => {
                if (card._id.toString() === targetedCard._id.toString()) {
                  const equipements = (card.equipements || []).map((eq, idx, arr) => {
                    const eqBase = eq.toObject?.() || eq;
                    return {
                      ...eqBase,
                      new: idx === arr.length - 1 // true solo para el último, false para el resto
                    };
                  });
                  return { ...card.toObject?.(), equipements };
                } else {
                  return card.toObject?.();
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
                pending_deck: updatedGame.playerPendingDeck.length,
                health: updatedGame.playerHp,
                mana: updatedGame.playerMana
              },
              rival: {
                hand: updatedGame.rivalHand.length,
                table: rivalTableupdated,
                pending_deck: updatedGame.rivalPendingDeck.length,
                health: updatedGame.rivalHp,
                mana: updatedGame.rivalMana
              }
            });
          } else {
            return req.response.error('Objetivo de hechizo no válido');
          }
        } else {
          return req.response.error('Efecto de hechizo no soportado');
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
  console.log('\n--------------------------------------------------------------------------------------\nIniciando la funcion de attack');
  try {
    const gameId = req.body.gameId;

    const game = await Game.findById(gameId);
    const player = await Player.findOne({ uid: req.body.playerId });

    if (!player) return req.response.error('Jugador no encontrado');
    if (!game) return req.response.error('Partida no encontrada');
    if (game.playerId !== player.uid) return req.response.error('El id del jugador no coincide con el de la partida');

    const cards = req.body.cards;
    console.log('\n----------------------------------------------------------\nCartas que van en el body.cards ==> ', cards);
    const attackers = await Promise.all(
      cards.map(async cardObj => {
        const card = game.playerTable.find(c => c._id.toString() === cardObj.id);
        if (!card) throw new Error(`Carta atacante no encontrada: ${cardObj.id}`);
        return card;
      })
    );

    console.log('\n----------------------------------------------------------\nAtacantes convertidos a objetos ==> ', attackers);

    console.log('\n----------------------------------------------------------\nLlamada a chooseDefenders con los atacantes y la mesa del rival');
    const assignments = chooseDefenders(attackers, game.rivalTable);

    console.log('\n----------------------------------------------------------\nAsignaciones de combate ==> ', assignments);

    console.log('\n----------------------------------------------------------\nLlamada a resolverCombate para cada asignación de combate');
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
      return req.response.success({
        action1: {
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
        },
        gameId: req.body.gameId,
        gameOver: true,
        winner: updatedGameResponse1.winner
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

    // action de robar carta
    try {
      console.log('\n----------------------------------------------------------\nEmpieza el siguiente turno (llamada a nextTurn)');
      await nextTurn({ game: updatedGameResponse1 });
    } catch (error) {
      return req.response.error(`Error al pasar al siguiente turno: ${error.message}`);
    }

    const updatedGameNextTurn = await Game.findById(gameId);

    try {
      console.log('\n----------------------------------------------------------\nEmpieza el robo de carta para el rival (llamada a drawCard)');
      await drawCard({ game: updatedGameNextTurn, isAI: true });
    } catch (error) {
      return req.response.error(`Error al robar carta: ${error.message}`);
    }

    const updatedGameAfterDrawing = await Game.findById(gameId);

    try {
      console.log('\n----------------------------------------------------------\nColocando cartas (llamada a placeCards)');
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
      }
    } catch (error) {
      return req.response.error(`Error al mover cartas muertas al graveyard: ${error.message}`);
    }

    const updatedGameAfterPlacingCards = await Game.findById(gameId);

    try {
      if (updatedGameAfterPlacingCards.rivalTable.length > 0) {
        console.log('\n----------------------------------------------------------\nCambiando posición de cartas a ataque (llamada a changeCardsPositionToAttack)');
        await changeCardsPositionToAttack(updatedGameAfterPlacingCards);
      }
    } catch (error) {
      return req.response.error(`Error al cambiar posición de cartas a ataque: ${error.message}`);
    }

    const updatedGameResponse3 = await Game.findById(gameId);

    return req.response.success({
      gameId: req.body.gameId,
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
  console.log('\n--------------------------------------------------------------------------------------\nIniciando la funcion de defend');
  try {
    const gameId = req.body.gameId;

    const game = await Game.findById(gameId);
    const player = await Player.findOne({ uid: req.body.playerId });

    if (!player) return req.response.error('Jugador no encontrado');
    if (!game) return req.response.error('Partida no encontrada');
    if (game.playerId !== player.uid) return req.response.error('El id del jugador no coincide con el de la partida');

    const combats = [];
    for (const combat of req.body.battles) {
      combats.push({
        attacker: combat.atacanteId,
        defender: combat.defensorId
      });
    }

    console.log('\n----------------------------------------------------------\nCombates a resolver ==> ', combats);

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
      console.log('\n----------------------------------------------------------\nEmpieza el siguiente turno (llamada a nextTurn)');
      await nextTurn({ game: updatedGame });
    } catch (error) {
      return req.response.error(`Error al pasar al siguiente turno: ${error.message}`);
    }

    const updatedGameNextTurn = await Game.findById(gameId);

    try {
      console.log('\n----------------------------------------------------------\nEmpieza el robo de carta para el rival (llamada a drawCard)');
      await drawCard({ game: updatedGameNextTurn, isAI: false });
    } catch (error) {
      return req.response.error(`Error al robar carta: ${error.message}`);
    }

    const updatedGameAfterDrawing = await Game.findById(gameId);

    try {
      // Cambiar el campo position de todas las cartas de la mesa del player y del rival a 'waiting'
      const updatedPlayerTable = updatedGameAfterDrawing.playerTable.map(card => ({
        ...card.toObject?.() || card,
        position: 'waiting'
      }));
      const updatedRivalTable = updatedGameAfterDrawing.rivalTable.map(card => ({
        ...card.toObject?.() || card,
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
