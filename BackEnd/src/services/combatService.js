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
      validDefenders.reduce((bestIdx, d, i, arr) => d.hp > arr[bestIdx].hp ? i : bestIdx, 0);

    const chosenDefender = validDefenders[bestDefenderIdx];
    assignments.push({ attacker, defender: chosenDefender });
    availableDefenders = availableDefenders.filter(d => d._id !== chosenDefender._id);
  }
  return assignments;
}

async function resolverCombate({ gameId, attacker, defender, isAI }) {
  console.log('\n---------------------------------\nAtaque y vida del attacker antes de sumar equipements ==> ', attacker.atk, attacker.hp);
  console.log('\n---------------------------------\nAtaque y vida del defender antes de sumar equipements ==> ', defender.atk, defender.hp);
  const attackerBase = attacker.toObject?.() || attacker;
  const defenderBase = defender.toObject?.() || defender;

  // Sumar equipements al atacante
  let attackerAtk = attackerBase.atk || 0;
  let attackerHp = attackerBase.hp || 0;
  if (Array.isArray(attackerBase.equipements)) {
    for (const eq of attackerBase.equipements) {
      attackerAtk += eq.atk || 0;
      attackerHp += eq.hp || 0;
    }
  }

  // Sumar equipements al defensor
  let defenderAtk = defenderBase.atk || 0;
  let defenderHp = defenderBase.hp || 0;
  if (Array.isArray(defenderBase.equipements)) {
    for (const eq of defenderBase.equipements) {
      defenderAtk += eq.atk || 0;
      defenderHp += eq.hp || 0;
    }
  }

  console.log('\n---------------------------------\nAtaque y vida del attacker después de sumar equipements ==> ', attackerAtk, attackerHp);
  console.log('\n---------------------------------\nAtaque y vida del defender después de sumar equipements ==> ', defenderAtk, defenderHp);

  const hpField = defender === "player" ? (isAI ? "playerHp" : "rivalHp") : null;
  console.log('\n---------------------------------\nhpField ==> ', hpField);
  // Asegurar que dmg siempre es un número
  const dmg = typeof attacker.atk === 'number' && !isNaN(attacker.atk) ? attacker.atk : 0;

  const gameDoc = await Game.findById(gameId);
  if (!gameDoc) return;

  if (hpField) {
    const nuevaVida = Math.max(0, gameDoc[hpField] - dmg);
    console.log('\n---------------------------------\nNueva vida del jugador ==> ', nuevaVida);
    await Game.updateOne({ _id: gameId }, { $set: { [hpField]: nuevaVida } });
    return;
  }

  const attackerHabs = new Set(attacker.abilities || []);
  const attackerTempHabs = new Set(attacker.temporaryAbilities || []);
  const defenderHabs = new Set(defender.abilities || []);
  const defenderTempHabs = new Set(defender.temporaryAbilities || []);

  console.log('\n---------------------------------\nHabilidades del atacante ==> ', attackerHabs);
  console.log('\n---------------------------------\nHabilidades temporales del atacante ==> ', attackerTempHabs);
  console.log('\n---------------------------------\nHabilidades del defensor ==> ', defenderHabs);
  console.log('\n---------------------------------\nHabilidades temporales del defensor ==> ', defenderTempHabs);

  const defenderInvulnerable = defenderHabs.has("invulnerable") || defenderTempHabs.has("invulnerable");
  const defenderToqueMortal = defenderHabs.has("mortal touch");
  const attackerInvulnerable = attackerHabs.has("invulnerable") || attackerTempHabs.has("invulnerable");
  const attackerToqueMortal = attackerHabs.has("mortal touch");
  const attackerBruteForce = attackerHabs.has("brute force");

  // Usar los valores sumados
  const result = {
    attacker: { ...attackerBase, atk: attackerAtk, hp: attackerHp },
    defender: { ...defenderBase, atk: defenderAtk, hp: defenderHp },
    dmgToPlayer: 0
  };

  console.log('\n---------------------------------\nResultado del combate antes de aplicar daño ==> ', result);

  // Lógica de daño considerando habilidades
  // 1. Si el defensor es invulnerable, no recibe daño ni muere por toque mortal
  if (!defenderInvulnerable) {
    if (attackerToqueMortal) {
      result.defender.hp = 0;
    } else {
      result.defender.hp -= result.attacker.atk;
    }
  }
  // 2. Si el atacante es invulnerable, no recibe daño ni muere por toque mortal
  if (!attackerInvulnerable) {
    if (defenderToqueMortal) {
      result.attacker.hp = 0;
    } else {
      result.attacker.hp -= result.defender.atk;
    }
  }

  // 3. Brute force: el exceso de daño pasa al jugador si el defensor muere y no es invulnerable
  if (attackerBruteForce && result.defender.hp <= 0 && !defenderInvulnerable) {
    const excess = result.attacker.atk - (result.defender.hp + result.attacker.atk); // daño sobrante
    if (excess > 0) result.dmgToPlayer = excess;
  }

  // 4. No permitir vida negativa
  result.attacker.hp = Math.max(0, result.attacker.hp);
  result.defender.hp = Math.max(0, result.defender.hp);

  console.log('\n---------------------------------\nResultado del combate después de aplicar daño ==> ', result);


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

  console.log('\n---------------------------------\nMesa del atacante despues de actualizar ==> ', gamelatestUpdated[attackerTable]);

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
  console.log('\n---------------------------------\nMesa del defensor despues de actualizar ==> ', gamelatestUpdated[defenderTable]);
}

module.exports = { chooseDefenders, resolverCombate };