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

  const result = { attacker: { ...attacker }, defender: { ...defender }, dmgToPlayer: 0 };

  if (!defenderInvulnerable) {
    result.defender.hp = attackerToqueMortal ? 0 : result.defender.hp - attacker.atk;
  }
  if (!attackerHabs.has("invulnerable")) {
    const defenderToqueMortal = defenderHabs.has("mortal touch");
    result.attacker.hp = defenderToqueMortal ? 0 : result.attacker.hp - defender.atk;
  }

  if (attackerBruteForce && result.defender.hp <= 0 && !defenderInvulnerable) {
    const excess = attacker.atk - defender.hp;
    if (excess > 0) result.dmgToPlayer = excess;
  }

  result.attacker.hp = Math.max(0, result.attacker.hp);
  result.defender.hp = Math.max(0, result.defender.hp);

  const attackerTable = isAI ? "rivalTable" : "playerTable";
  const defenderTable = isAI ? "playerTable" : "rivalTable";

  if (result.attacker.hp > 0) {
    await Game.updateOne(
      { _id: gameId, [`${attackerTable}._id`]: result.attacker._id },
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
      { _id: gameId, [`${attackerTable}._id`]: result.attacker._id },
      {
        $set: { [`${attackerTable}.$.alive`]: false }
      }
    );
  }

  if (result.defender.hp > 0) {
    await Game.updateOne(
      { _id: gameId, [`${defenderTable}._id`]: result.defender._id },
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
      { _id: gameId, [`${defenderTable}._id`]: result.defender._id },
      {
        $set: { [`${defenderTable}.$.alive`]: false }
      }
    );
  }
}

module.exports = { chooseDefenders, resolverCombate };