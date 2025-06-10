const BattlePass = require('../models/battlePass');
const Player = require('../models/Player');
const { generateDefaultLevels } = require('../utils/battlePassUtils');

async function getBattlePasses(req, res) {
    try {
        
        const battlePass = await BattlePass.find();
        if (!battlePass) {
            return { error: 'Pase de batalla no encontrado' };
        }
        return req.response.success({ battlePass });
    }
    catch (error) {
        return req.response.error(`Error recogiendo el pase de batalla: ${error.message}`);
    }
}

async function createBattlePass(idPlayer) {
    try {
        const playerId = idPlayer;

        // const existingBattlePass = await BattlePass.findOne({ playerId });
        // if (existingBattlePass) {
        //     return req.response.error('Battle Pass already exists for this player');
        // }

        const levels = generateDefaultLevels();

        const newBattlePass = new BattlePass({
            playerId: playerId,
            actual_level: 0,
            levels: levels
        });

        const battlePassSaved = await newBattlePass.save();

        return { mensaje: 'Pase de batalla creado correctamente', battlePass: battlePassSaved };
    }
    catch (error) {
        console.error('Error creando el pase de batalla:', error);
        return { error: 'Error creando el pase de batalla' };
    }
}

async function updateBattlePass(playerId) {
    try {
        const player = await Player.findOne({ uid: playerId });
        if (!player) {
            return { error: 'Player no encontrado' };
        }

        const playerLevel = player.player_level;

        const battlePass = await BattlePass.findOne({ playerId });
        if (!battlePass) {
            return { error: 'Pase de batalla no encontrado para este jugador' };
        }

        if (battlePass.actual_level >= battlePass.levels.length) {
            return { error: 'Ya has alcanzado el nivel máximo del Pase de Batalla' };
        }

        if (playerLevel > battlePass.actual_level) {
            const startLevel = battlePass.actual_level;
            const endLevel = playerLevel;

            const levelsToUpdate = battlePass.levels.slice(startLevel, endLevel);

            const rewardHandlers = {
                coins: reward => {
                    player.coins = (player.coins || 0) + (reward.coins || 0);
                },
                avatar: reward => {
                    const avatarId = reward.avatarId;
                    player.unlocked_avatars.push(avatarId);
                    
                    let idx = player.locked_avatars.indexOf(avatarId);
                    if (idx !== -1) {
                        player.locked_avatars.splice(idx, 1);
                    }

                },
                deck: reward => {
                    player.decks = player.decks || [];
                    if (!player.owned_decks.includes(reward.deckId)) {
                        player.owned_decks.push(reward.deckId);
                        let idx = player.locked_decks.indexOf(reward.deckId);
                        if (idx !== -1) {
                            player.locked_decks.splice(idx, 1);
                        }
                    }
                }
                // Puedes agregar más handlers si añades tipos nuevos
            };

            for (const level of levelsToUpdate) {
                level.completed = true;
                const handler = rewardHandlers[level.type];
                if (handler) {
                    handler(level.rewards);
                } else {
                    console.warn(`Tipo de recompensa desconocido: ${level.type}`);
                }
            }

            // Actualizar el nivel actual
            battlePass.actual_level = playerLevel;

            // Guardar ambos documentos
            await Promise.all([player.save(), battlePass.save()]);
        }

    } catch (error) {
        console.error('Error updating Battle Pass:', error);
        return { error: 'Error updating Battle Pass' };
    }
}

async function deleteBattlePass(playerId) {
    try {
        const battlePass = await BattlePass.findOneAndDelete({ playerId });
        if (!battlePass) {
            return { error: 'Pase de batalla no encontrado para este jugador' };
        }
        req.response.success({ message: 'Battle Pass deleted successfully' });
    } catch (error) {
        req.response.error(`Error eliminando el pase de batalla: ${error.message}`);
    }
}

module.exports = {
    getBattlePasses,
    createBattlePass,
    updateBattlePass,
    deleteBattlePass
};