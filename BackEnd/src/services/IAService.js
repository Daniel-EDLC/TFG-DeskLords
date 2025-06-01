const Game = require('../models/Game');

async function placeCards(game) {
  let rivalHand = [...game.rivalHand];
  let rivalTable = [...game.rivalTable];
  let playerTable = [...game.playerTable];
  let playerGraveyard = [...game.playerGraveyard];
  let rivalMana = game.rivalMana;
  let usedCards = [];
  let spellUsed = false;
  let equipementUsed = false;

  let actionSpell = {
    spell: null, // Spell to use
    target: null, // Target for the spell
  }

  let actionEquipement = {
    equipement: null, // Equipement to use
    target: null, // Target for the equipement
  }


  // 1. Spell
  const spellIdx = rivalHand.findIndex(c => c.type === 'spell' && c.cost <= rivalMana);
  if (spellIdx !== -1 && !spellUsed) {
    const spell = rivalHand[spellIdx];
    if (spell.effect === 'kill' && playerTable.length > 0) {
      const idx = playerTable.reduce((maxIdx, c, i, arr) => c.cost > arr[maxIdx].cost ? i : maxIdx, 0);
      playerGraveyard.push(playerTable[idx]);
      playerTable.splice(idx, 1);
      rivalMana -= spell.cost;
      usedCards.push(spell._id);
      spellUsed = true;
      actionSpell.target = playerTable[idx];
    } else if (spell.effect === 'protect' && rivalTable.length > 0) {
      const idx = rivalTable.reduce((minIdx, c, i, arr) => c.hp < arr[minIdx].hp ? i : minIdx, 0);
      rivalTable[idx].temporaryAbilities = [...(rivalTable[idx].temporaryAbilities || []), 'invulnerable'];
      rivalMana -= spell.cost;
      usedCards.push(spell._id);
      spellUsed = true;
      actionSpell.target = rivalTable[idx];
    }

    actionSpell.spell = spell;
  }

  // 2. Equipement
  const equipementIdx = rivalHand.findIndex(c => c.type === 'equipement' && c.cost <= rivalMana);
  if (equipementIdx !== -1 && !equipementUsed) {
    const equip = rivalHand[equipementIdx];
    if (rivalTable.length > 0) {
      const idx = equip.atk > equip.hp ?
        rivalTable.reduce((minIdx, c, i, arr) => c.atk < arr[minIdx].atk ? i : minIdx, 0) :
        rivalTable.reduce((minIdx, c, i, arr) => c.hp < arr[minIdx].hp ? i : minIdx, 0);

      rivalTable[idx].equipements = [...(rivalTable[idx].equipements || []), equip];
      rivalMana -= equip.cost;
      usedCards.push(equip._id);
      equipementUsed = true;
      actionEquipement.equipement = equip;
      actionEquipement.target = rivalTable[idx];
    }
  }

  // 3. Criature
  let criatureHand = rivalHand.filter(c => c.type === 'criature' && c.cost <= rivalMana && !usedCards.includes(c._id));

  const sumAtkPlayer = playerTable.reduce((acc, c) => acc + (c.atk || 0), 0);
  const sumHpPlayer = playerTable.reduce((acc, c) => acc + (c.hp || 0), 0);
  const sumAtkRival = rivalTable.reduce((acc, c) => acc + (c.atk || 0), 0);
  const sumHpRival = rivalTable.reduce((acc, c) => acc + (c.hp || 0), 0);

  while (criatureHand.length > 0 && rivalMana > 0) {
    let idx = -1;
    if (sumAtkPlayer > sumHpRival) {
      idx = criatureHand.reduce((bestIdx, c, i, arr) => c.hp > arr[bestIdx].hp ? i : bestIdx, 0);
    } else if (sumHpPlayer > sumAtkRival) {
      idx = criatureHand.reduce((bestIdx, c, i, arr) => c.atk > arr[bestIdx].atk ? i : bestIdx, 0);
    }

    if (idx !== -1 && criatureHand[idx].cost <= rivalMana) {
      rivalTable.push(criatureHand[idx]);
      rivalMana -= criatureHand[idx].cost;
      usedCards.push(criatureHand[idx]._id);
      criatureHand.splice(idx, 1);
    } else {
      break;
    }
  }

  rivalHand = rivalHand.filter(c => !usedCards.includes(c._id));

  await Game.updateOne(
    { _id: game._id },
    {
      $set: {
        rivalHand,
        rivalTable,
        playerTable,
        playerGraveyard,
        rivalMana,
      },
    }
  );

  return {spell: actionSpell, equipement: actionEquipement, rivalTable: game.rivalTable};
}

module.exports = { placeCards };
