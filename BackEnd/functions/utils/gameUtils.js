function generateWinResponse(game, assignments, gameRewards, battlePassRewards) {
    return {
        action1: {
            turn: {
                number: game.currentTurn,
                whose: "player",
                phase: "defense"
            },
            battle_result: assignments.map(a => ({
                attacker: a.attacker._id,
                defender: a.defender === "player" ? "player" : a.defender._id,
            })),
            user: {
                table: game.playerTable,
                health: game.playerHp,
            },
            rival: {
                hand: game.rivalHand.length,
                table: game.rivalTable,
                pending_deck: game.rivalPendingDeck.length,
                health: game.rivalHp,
                mana: game.rivalMana
            }
        },
        action2: {
            usedCards: [],
            turn: {
                number: game.currentTurn,
                whose: "rival",
                phase: "hand"
            },
            user: {
                hand: game.playerHand,
                table: game.playerTable,
                pending_deck: game.playerPendingDeck.length,
                health: game.playerHp,
                mana: game.playerMana
            },
            rival: {
                hand: game.rivalHand.length,
                table: game.rivalTable,
                pending_deck: game.rivalPendingDeck.length,
                health: game.rivalHp,
                mana: game.rivalMana
            }
        },
        action3: {
            turn: {
                number: game.currentTurn,
                whose: "rival",
                phase: "attack"
            },
            rival: {
                hand: game.rivalHand.length,
                table: game.rivalTable,
                pending_deck: game.rivalPendingDeck.length,
                health: game.rivalHp,
                mana: game.rivalMana
            },
            user: {
                hand: game.playerHand,
                table: game.playerTable,
                pending_deck: game.playerPendingDeck.length,
                health: game.playerHp,
                mana: game.playerMana
            }
        },
        gameId: game._id.toString(),
        gameOver: true,
        winner: game.winner,
        rewards: gameRewards || [],
        battlePassRewards: battlePassRewards || [],
    }
}

module.exports = generateWinResponse;