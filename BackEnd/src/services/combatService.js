const Game = require('../models/Game');

function chooseDefenders(attackingCards, rivalTable) {
  let availableDefenders = [...rivalTable];
  const assignments = [];

  for (const attacker of attackingCards) {
    const attackerAbilities = new Set(attacker.abilities || []);
    let validDefenders = availableDefenders.filter(defender => {
      if (attackerAbilities.has("volar")) {
        const defenderAbilities = new Set(defender.abilities || []);
        return defenderAbilities.has("volar");
      }
      return true;
    });

    if (validDefenders.length === 0) {
      assignments.push({ attacker, defender: "player" });
      continue;
    }

    let idxInvulnerable = validDefenders.findIndex(defender => {
      const abilities = new Set(defender.abilities || []);
      const tempAbilities = new Set(defender.temporaryAbilities || []);
      return abilities.has("invulnerable") || tempAbilities.has("invulnerable");
    });

    let bestDefenderIdx = idxInvulnerable !== -1 ? idxInvulnerable :
      validDefenders.reduce((bestIdx, d, i, arr) => (d.hp || 0) > (arr[bestIdx].hp || 0) ? i : bestIdx, 0);

    const chosenDefender = validDefenders[bestDefenderIdx];
    assignments.push({ attacker, defender: chosenDefender });
    availableDefenders = availableDefenders.filter(d => d._id !== chosenDefender._id);
  }
  return assignments;
}

async function resolverCombate({ gameId, attacker, defender, isAI }) {
  // Sumar equipements al atacante
  if (Array.isArray(attacker.equipements) && attacker.equipements.length > 0) {
    for (const eq of attacker.equipements) {
      attacker.atk += eq.atk || 0;
      attacker.hp += eq.hp || 0;
    }
  }
  // Sumar equipements al defensor
  if (Array.isArray(defender.equipements) && defender.equipements.length > 0) {
    for (const eq of defender.equipements) {
      defender.atk += eq.atk || 0;
      defender.hp += eq.hp || 0;
    }
  }

  const hpField = defender === "player" ? (isAI ? "playerHp" : "rivalHp") : null;
  // Asegurar que dmg siempre es un número
  const dmg = typeof attacker.atk === 'number' && !isNaN(attacker.atk) ? attacker.atk : 0;

  const gameDoc = await Game.findById(gameId);
  if (!gameDoc) return;

  if (hpField) {
    const nuevaVida = Math.max(0, (gameDoc[hpField] || 0) - dmg);
    await Game.updateOne({ _id: gameId }, { $set: { [hpField]: nuevaVida } });
    return;
  }

  const attackerHabs = new Set(attacker.abilities || []);
  const defenderHabs = new Set(defender.abilities || []);
  const defenderTempHabs = new Set(defender.temporaryAbilities || []);

  const defenderInvulnerable = defenderHabs.has("invulnerable") || defenderTempHabs.has("invulnerable");
  const attackerToqueMortal = attackerHabs.has("mortal touch");
  const attackerBruteForce = attackerHabs.has("brute force");

  console.log("\nAttacker ==> ", attacker);
  console.log("\nDefender ==> ", defender);

  // Usar los valores sumados
  const result = {
    attacker: attacker.toObject() ? attacker.toObject() : attacker,
    defender: defender.toObject() ? defender.toObject() : defender,
    dmgToPlayer: 0
  };

  console.log("\nCartas guardadas en el combate:", result);

  if (!defenderInvulnerable) {
    result.defender.hp = attackerToqueMortal ? 0 : result.defender.hp - result.attacker.atk;
  }
  if (!attackerHabs.has("invulnerable")) {
    const defenderToqueMortal = defenderHabs.has("mortal touch");
    result.attacker.hp = defenderToqueMortal ? 0 : result.attacker.hp - result.defender.atk;
  }

  if (attackerBruteForce && result.defender.hp <= 0 && !defenderInvulnerable) {
    const excess = result.attacker.atk - result.defender.hp;
    if (excess > 0) result.dmgToPlayer = excess;
  }

  result.attacker.hp = Math.max(0, result.attacker.hp);
  result.defender.hp = Math.max(0, result.defender.hp);

  const attackerTable = isAI ? "rivalTable" : "playerTable";
  const defenderTable = isAI ? "playerTable" : "rivalTable";

  const gameUpdated = await Game.findById(gameId);

  if (result.attacker.hp > 0) {
    await Game.updateOne(
      { _id: gameUpdated._id, [`${attackerTable}._id`]: result.attacker._id },
      {
        $set: {
          [`${attackerTable}.$.hp`]: result.attacker.hp,
          [`${attackerTable}.$.temporaryAbilities`]: [],
          [`${attackerTable}.$.alive`]: true,
        },
      }
    );
  } else {
    await Game.updateOne(
      { _id: gameUpdated._id, [`${attackerTable}._id`]: result.attacker._id },
      {
        $set: {
          [`${attackerTable}.$.alive`]: false,
          [`${attackerTable}.$.hp`]: 0,
        }
      }
    );
  }

  const gamelatestUpdated = await Game.findById(gameId);

  console.log("\nGame updated:", gamelatestUpdated);

  if (result.defender.hp > 0) {
    await Game.updateOne(
      { _id: gamelatestUpdated._id, [`${defenderTable}._id`]: result.defender._id },
      {
        $set: {
          [`${defenderTable}.$.hp`]: result.defender.hp,
          [`${defenderTable}.$.effect`]: result.defender.effect,
          [`${defenderTable}.$.temporaryAbilities`]: [],
          [`${defenderTable}.$.alive`]: true,
        },
      }
    );
  } else {
    await Game.updateOne(
      { _id: gamelatestUpdated._id, [`${defenderTable}._id`]: result.defender._id },
      {
        $set: { 
          [`${defenderTable}.$.alive`]: false,
          [`${defenderTable}.$.hp`]: 0,
        }
      }
    );
  }
}

module.exports = { chooseDefenders, resolverCombate };