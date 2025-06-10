const BattlePass = require('../models/battlePass');

function generateDefaultLevels() {
  return [
    { type: 'coins', rewards: { coins: 50, image: "https://storage.googleapis.com/imagenes-desklords/Imagenes_Monedas/icono_moneda-battlepass.png"} },
    { type: 'coins', rewards: { coins: 100, image: "https://storage.googleapis.com/imagenes-desklords/Imagenes_Monedas/icono_moneda-battlepass.png" } },
    { type: 'coins', rewards: { coins: 150, image: "https://storage.googleapis.com/imagenes-desklords/Imagenes_Monedas/icono_moneda-battlepass.png" } },
    { type: 'coins', rewards: { coins: 200, image: "https://storage.googleapis.com/imagenes-desklords/Imagenes_Monedas/icono_moneda-battlepass.png" } },
    { type: 'avatar', rewards: { avatarId: '68409ca43db01d0ce3925bf9', image: "https://storage.googleapis.com/imagenes-desklords/Imagenes_Perfil/Avatar%205.png" } },
    { type: 'coins', rewards: { coins: 250, image: "https://storage.googleapis.com/imagenes-desklords/Imagenes_Monedas/icono_moneda-battlepass.png" } },
    { type: 'coins', rewards: { coins: 300, image: "https://storage.googleapis.com/imagenes-desklords/Imagenes_Monedas/icono_moneda-battlepass.png" } },
    { type: 'coins', rewards: { coins: 350, image: "https://storage.googleapis.com/imagenes-desklords/Imagenes_Monedas/icono_moneda-battlepass.png" } },
    { type: 'coins', rewards: { coins: 400, image: "https://storage.googleapis.com/imagenes-desklords/Imagenes_Monedas/icono_moneda-battlepass.png" } },
    { type: 'deck', rewards: { deckId: '68445462751c23f738012ae9', image: "https://storage.googleapis.com/imagenes-desklords/Imagenes_Decks/Reino.png" } },
  ];
}

async function getBattlePassPlayer(idPlayer) {

  const battlePassData = await BattlePass.findOne({ playerId: idPlayer });

  const playerBattlePass = {
    levels: battlePassData.levels,
    actualLevel: battlePassData.actual_level,
    totalLevels: battlePassData.levels.length,
    completedLevels: battlePassData.completed_levels,
  };

  return playerBattlePass;
}

module.exports = { generateDefaultLevels, getBattlePassPlayer };