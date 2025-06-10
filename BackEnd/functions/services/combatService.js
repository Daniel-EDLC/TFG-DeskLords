const Game = require('../models/Game');

function chooseDefenders(attackingCards, rivalTable) {
  let availableDefenders = [...rivalTable];
  const assignments = [];

  for (const attacker of attackingCards) {
    const attackerHabs = new Set(attacker.abilities || []);
    let validDefenders = availableDefenders.filter(defender => {
      const defenderHabs = new Set(defender.abilities || []);
      if (attackerHabs.has("volar")) {
        // Puede ser defendido por "volar" o "ranged"
        return defenderHabs.has("volar") || defenderHabs.has("ranged");
      }
      return true;
    });
    console.log(`\n\n\n\n\nAtacante: ${attacker._id}, defensores válidos: ${validDefenders.map(d => d._id)}\n\n\n\n`);

    if (validDefenders.length === 0) {
      assignments.push({ attacker, defender: "rival" });
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
    assignments.push({ attacker: attacker._id, defender: chosenDefender._id });
    availableDefenders = availableDefenders.filter(d => d._id !== chosenDefender._id);
  }
  return assignments;
}

async function resolverCombate({ gameId, assignments, isAI }) {
  const gameDoc = await Game.findById(gameId);
  if (!gameDoc) return;

  // Copias locales de las mesas y vidas
  let playerTable = [...gameDoc.playerTable.map(c => ({ ...c.toObject?.() || c }))];
  let rivalTable = [...gameDoc.rivalTable.map(c => ({ ...c.toObject?.() || c }))];
  let playerHp = gameDoc.playerHp;
  let rivalHp = gameDoc.rivalHp;

  // Para lookup rápido
  const getCard = (table, id) => table.find(c => c._id.toString() === id.toString());

  // Acumular daños directos
  let directDamage = { playerHp: 0, rivalHp: 0 };

  for (const assignment of assignments) {
    // Determinar mesas según quién ataca
    const attackerTableArr = isAI ? rivalTable : playerTable;
    const defenderTableArr = isAI ? playerTable : rivalTable;

    const attackerId = assignment.attacker._id ? assignment.attacker._id.toString() : assignment.attacker.toString();
    const defenderId = assignment.defender && assignment.defender._id ? assignment.defender._id.toString() : assignment.defender?.toString();

    const isDirectAttack = assignment.defender === "player" || assignment.defender === "rival";

    const attackerObj = getCard(attackerTableArr, attackerId);
    const defenderObj = isDirectAttack ? null : getCard(defenderTableArr, defenderId);

    // --- FLY LOGIC ---
    const attackerAbilities = new Set(attackerObj.abilities || []);
    const attackerHasFly = attackerAbilities.has("fly");
    let defenderHasFly = false;
    let defenderHasRanged = false;
    if (defenderObj) {
      const defenderAbilities = new Set(defenderObj.abilities || []);
      defenderHasFly = defenderAbilities.has("fly");
      defenderHasRanged = defenderAbilities.has("ranged");
    }

    // Si el atacante vuela y el defensor no tiene ni fly ni ranged, el ataque es directo
    if (!isDirectAttack && attackerHasFly && !defenderHasFly && !defenderHasRanged) {
      // Daño directo
      let hpField = null;
      if (!isAI) hpField = "rivalHp";
      else hpField = "playerHp";
      let attackerAtk = attackerObj.atk || 0;
      directDamage[hpField] += attackerAtk;
      continue; // Saltar el combate normal
    }

    if (isDirectAttack) {
      // Daño directo
      let hpField = null;
      if (!isAI && assignment.defender === "rival") hpField = "rivalHp";
      else if (isAI && assignment.defender === "player") hpField = "playerHp";
      if (hpField) {
        let attackerAtk = attackerObj.atk || 0;
        directDamage[hpField] += attackerAtk;
      }
      continue;
    }

    // Recoger habilidades del atacante y defensor
    const attackerHabs = new Set(attackerObj.abilities || []);
    const attackerTempHabs = new Set(attackerObj.temporaryAbilities || []);
    const defenderHabs = new Set(defenderObj.abilities || []);
    const defenderTempHabs = new Set(defenderObj.temporaryAbilities || []);

    // Habilidades del atacante
    const attackerInvulnerable = attackerHabs.has("invulnerable") || attackerTempHabs.has("invulnerable");
    const attackerToqueMortal = attackerHabs.has("mortal touch");
    const attackerBruteForce = attackerHabs.has("brute force");
    const attackerRanged = attackerHabs.has("ranged");

    // Habilidades del defensor
    const defenderInvulnerable = defenderHabs.has("invulnerable") || defenderTempHabs.has("invulnerable");
    const defenderToqueMortal = defenderHabs.has("mortal touch");

    // Resultado inicial
    let result = {
      attacker: { ...attackerObj },
      defender: { ...defenderObj },
      dmgToPlayer: 0
    };

    // Lógica de daño
    if (!defenderInvulnerable) {
      if (attackerToqueMortal) result.defender.hp = 0;
      else result.defender.hp -= result.attacker.atk;
    }

    // Si el atacante tiene ranged o invulnerable, el defensor NO le hace daño
    if (!attackerInvulnerable && !attackerRanged) {
      if (defenderToqueMortal) result.attacker.hp = 0;
      else result.attacker.hp -= result.defender.atk;
    }

    // Brute force: exceso de daño al jugador
    if (attackerBruteForce && result.defender.hp <= 0 && !defenderInvulnerable) {
      const excess = result.attacker.atk - defenderObj.hp;
      if (excess > 0) result.dmgToPlayer = excess;
    }

    // No permitir vida negativa
    result.attacker.hp = Math.max(0, result.attacker.hp);
    result.defender.hp = Math.max(0, result.defender.hp);

    // Actualizar attacker
    const attIdx = attackerTableArr.findIndex(c => c._id.toString() === attackerId);
    if (attIdx !== -1) {
      attackerTableArr[attIdx] = {
        ...attackerTableArr[attIdx],
        hp: result.attacker.hp,
        alive: result.attacker.hp > 0,
        temporaryAbilities: [],
      };
    }
    // Actualizar defender
    const defIdx = defenderTableArr.findIndex(c => c._id.toString() === defenderId);
    if (defIdx !== -1) {
      defenderTableArr[defIdx] = {
        ...defenderTableArr[defIdx],
        hp: result.defender.hp,
        alive: result.defender.hp > 0,
        temporaryAbilities: [],
      };
    }
    // Daño excedente
    if (result.dmgToPlayer > 0) {
      if (isAI) playerHp = Math.max(0, playerHp - result.dmgToPlayer);
      else rivalHp = Math.max(0, rivalHp - result.dmgToPlayer);
    }
  }

  // Aplicar daño directo acumulado
  if (directDamage.playerHp > 0) playerHp = Math.max(0, playerHp - directDamage.playerHp);
  if (directDamage.rivalHp > 0) rivalHp = Math.max(0, rivalHp - directDamage.rivalHp);

  // Guardar todo en la base de datos de una vez
  await Game.updateOne(
    { _id: gameId },
    {
      $set: {
        playerTable,
        rivalTable,
        playerHp,
        rivalHp
      }
    }
  );
}

module.exports = { chooseDefenders, resolverCombate };