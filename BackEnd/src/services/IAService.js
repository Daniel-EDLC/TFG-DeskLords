const Game = require('../models/Game');

async function placeCards(game) {
  let rivalHand = [...game.rivalHand];
  let rivalTable = [...game.rivalTable];
  let playerTable = [...game.playerTable];
  let rivalMana = game.rivalMana;
  let usedCards = [];
  let spellUsed = false;
  let equipementUsed = false;

  // ---------------------
  // 1. Spell - "kill"
  // ---------------------
  if (!spellUsed) {
    const spellIdx = rivalHand.findIndex(c => c.type === 'spell' && c.effect === 'kill' && c.cost <= rivalMana);
    if (spellIdx !== -1 && playerTable.length > 0) {
      const spell = rivalHand[spellIdx];
      const idx = playerTable.reduce((maxIdx, c, i, arr) => c.cost > arr[maxIdx].cost ? i : maxIdx, 0);

      playerTable[idx].alive = false;
      playerTable[idx].equipements = [...(playerTable[idx].equipements || []), spell];

      rivalMana -= spell.cost;
      usedCards.push(spell._id.toString());
      spellUsed = true;
    }
  }

  // ---------------------
  // 2. Criaturas
  // ---------------------
  let criatureHand = rivalHand.filter(c => c.type === 'creature' && c.cost <= rivalMana && !usedCards.includes(c._id.toString()));

  const sumAtkPlayer = playerTable.reduce((acc, c) => acc + (c.atk || 0), 0);
  const sumHpPlayer = playerTable.reduce((acc, c) => acc + (c.hp || 0), 0);
  const sumAtkRival = rivalTable.reduce((acc, c) => acc + (c.atk || 0), 0);
  const sumHpRival = rivalTable.reduce((acc, c) => acc + (c.hp || 0), 0);

  while (criatureHand.length > 0 && rivalMana > 0) {
    let idx = -1;

    if (playerTable.length === 0) {
      idx = criatureHand.reduce((bestIdx, c, i, arr) => c.atk > arr[bestIdx].atk ? i : bestIdx, 0);
    } else if (sumAtkPlayer > sumHpRival) {
      idx = criatureHand.reduce((bestIdx, c, i, arr) => c.hp > arr[bestIdx].hp ? i : bestIdx, 0);
    } else if (sumHpPlayer > sumAtkRival) {
      idx = criatureHand.reduce((bestIdx, c, i, arr) => c.atk > arr[bestIdx].atk ? i : bestIdx, 0);
    }

    if (idx !== -1 && criatureHand[idx].cost <= rivalMana) {
      rivalTable.push(criatureHand[idx]);
      rivalMana -= criatureHand[idx].cost;
      usedCards.push(criatureHand[idx]._id.toString());
      criatureHand.splice(idx, 1);
    } else {
      break;
    }
  }

  // ---------------------
  // 3. Equipement
  // ---------------------
  const equipementIdx = rivalHand.findIndex(c => c.type === 'equipement' && c.cost <= rivalMana);
  if (equipementIdx !== -1 && !equipementUsed && rivalTable.length > 0) {
    const equip = rivalHand[equipementIdx];

    const idx = equip.atk > equip.hp
      ? rivalTable.reduce((minIdx, c, i, arr) => c.atk < arr[minIdx].atk ? i : minIdx, 0)
      : rivalTable.reduce((minIdx, c, i, arr) => c.hp < arr[minIdx].hp ? i : minIdx, 0);

    rivalTable[idx].atk = (rivalTable[idx].atk || 0) + (equip.atk || 0);
    rivalTable[idx].hp = (rivalTable[idx].hp || 0) + (equip.hp || 0);
    rivalTable[idx].equipements = [...(rivalTable[idx].equipements || []), equip];

    rivalMana -= equip.cost;
    usedCards.push(equip._id.toString());
    equipementUsed = true;
  }

  // ---------------------
  // 4. Spell - "protect_one"
  // ---------------------
  if (!spellUsed) {
    const spellIdx = rivalHand.findIndex(c => c.type === 'spell' && c.effect === 'protect_one' && c.cost <= rivalMana);
    if (spellIdx !== -1 && rivalTable.length > 0) {
      const spell = rivalHand[spellIdx];

      const idx = rivalTable.reduce((minIdx, c, i, arr) => c.hp < arr[minIdx].hp ? i : minIdx, 0);

      rivalTable[idx].temporaryAbilities = [...(rivalTable[idx].temporaryAbilities || []), 'invulnerable'];
      spell.target = { ...(rivalTable[idx].toObject?.() || rivalTable[idx]) };
      rivalTable[idx].equipements = [...(rivalTable[idx].equipements || []), spell];

      rivalMana -= spell.cost;
      usedCards.push(spell._id.toString());
      spellUsed = true;
    }
  }

  // ---------------------
  // Limpieza y actualizaciones
  // ---------------------
  rivalHand = rivalHand.filter(c => !usedCards.includes(c._id.toString()));

  // Marcar cartas nuevas
  const markNewCards = (table) =>
    table.map(card => {
      const base = card.toObject?.() || card;
      const equipements = (base.equipements || []).map(eq => {
        const eqBase = eq.toObject?.() || eq;
        console.log('----------------------------------------------------------------------eqBase ==>', eqBase);
        return {
          ...eqBase,
          new: usedCards.includes(eqBase._id.toString())
        };
      });
      return {
        ...base,
        equipements,
        new: usedCards.includes(card._id.toString())
      };
    });

  playerTable = markNewCards(playerTable);
  rivalTable = markNewCards(rivalTable);

  await Game.updateOne(
    { _id: game._id },
    {
      $set: {
        playerTable,
        rivalTable,
        rivalHand,
        rivalMana,
      },
    }
  );

  console.log('\n-----------------------------------------------------------------------Cartas utilizadas:\n', usedCards);
}


async function changeCardsPositionToAttack(game) {
  const gameUpdated = await Game.findById(game._id);
  if (!gameUpdated) {
    throw new Error('Game not found');
  }

  const rivalTable = gameUpdated.rivalTable.map(card => ({
    ...card.toObject?.() || card,
    position: 'attack'
  }));

  const playerTable = gameUpdated.playerTable.map(card => ({
    ...card.toObject?.() || card,
    position: 'defense'
  }));

  await Game.updateOne(
    { _id: gameUpdated._id },
    {
      $set: {
        rivalTable,
        playerTable,
      }
    }
  );
}

module.exports = { placeCards, changeCardsPositionToAttack };
