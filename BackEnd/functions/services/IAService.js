const Game = require('../models/Game');

async function placeCards(game) {
  let rivalHand = [...game.rivalHand];
  let rivalTable = [...game.rivalTable];
  let playerTable = [...game.playerTable];
  let rivalMana = game.rivalMana;
  let usedCards = [];
  let spellUsed = false;
  let equipementUsed = false;


  // 1. Spell
  const spellIdx = rivalHand.findIndex(c => c.type === 'spell' && c.cost <= rivalMana);
  if (spellIdx !== -1 && !spellUsed) {

    console.log('\nSpell encontrado ==> ', rivalHand[spellIdx]);
    const spell = rivalHand[spellIdx];

    if (spell.effect === 'kill' && playerTable.length > 0) {
      console.log('\nSpell kill encontrado ==> ', spell);

      const idx = playerTable.reduce((maxIdx, c, i, arr) => c.cost > arr[maxIdx].cost ? i : maxIdx, 0);

      playerTable[idx].alive = false;
      playerTable[idx].equipements = [...(playerTable[idx].equipements || []), spell];
      console.log('\nSpell aplicado y guardado en la carta ==> ', playerTable[idx]);

      console.log('\nMana antes de restar: ', rivalMana, ', coste de la carta: ', spell.cost);
      rivalMana -= spell.cost;
      console.log('\nMana después de restar: ', rivalMana);

      usedCards.push(spell._id);
      spellUsed = true;

    } else if (spell.effect === 'protect_one' && rivalTable.length > 0) {

      const idx = rivalTable.reduce((minIdx, c, i, arr) => c.hp < arr[minIdx].hp ? i : minIdx, 0);

      rivalTable[idx].temporaryAbilities = [...(rivalTable[idx].temporaryAbilities || []), 'invulnerable'];

      console.log('\nMana antes de restar: ', rivalMana, ', coste de la carta: ', spell.cost);
      rivalMana -= spell.cost;
      console.log('\nMana después de restar: ', rivalMana);

      usedCards.push(spell._id);
      spellUsed = true;
    }
  }

  // 2. Equipement
  const equipementIdx = rivalHand.findIndex(c => c.type === 'equipement' && c.cost <= rivalMana);
  if (equipementIdx !== -1 && !equipementUsed) {
    console.log('\nEquipement encontrado ==> ', rivalHand[equipementIdx]);

    const equip = rivalHand[equipementIdx];

    if (rivalTable.length > 0) {

      const idx = equip.atk > equip.hp ?
        rivalTable.reduce((minIdx, c, i, arr) => c.atk < arr[minIdx].atk ? i : minIdx, 0) :
        rivalTable.reduce((minIdx, c, i, arr) => c.hp < arr[minIdx].hp ? i : minIdx, 0);

      rivalTable[idx].equipements = [...(rivalTable[idx].equipements || []), equip];
      console.log('\nEquipement guardado en la carta ==> ', rivalTable[idx]);

      console.log(`\nMana antes de restar: ${rivalMana}, coste de la carta: ${equip.cost}`);
      rivalMana -= equip.cost;
      console.log(`\nMana después de restar: ${rivalMana}`);

      usedCards.push(equip._id);
      equipementUsed = true;
    }
  }

  // 3. Criature
  let criatureHand = rivalHand.filter(c => c.type === 'creature' && c.cost <= rivalMana && !usedCards.includes(c._id));
  console.log('\nCriaturas en la mano del rival:', criatureHand);

  const sumAtkPlayer = playerTable.reduce((acc, c) => acc + (c.atk || 0), 0);
  const sumHpPlayer = playerTable.reduce((acc, c) => acc + (c.hp || 0), 0);
  const sumAtkRival = rivalTable.reduce((acc, c) => acc + (c.atk || 0), 0);
  const sumHpRival = rivalTable.reduce((acc, c) => acc + (c.hp || 0), 0);

  while (criatureHand.length > 0 && rivalMana > 0) {
    console.log('\nEntra en el while');
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
      
      console.log(`\nMana antes de restar: ${rivalMana}, coste de la carta: ${criatureHand[idx].cost}`);
      rivalMana = rivalMana - criatureHand[idx].cost;
      console.log(`\nMana después de restar: ${rivalMana}`);
      
      console.log('\nCriatura colocada en la mesa ==> ', criatureHand[idx]);
      usedCards.push(criatureHand[idx]._id);
      criatureHand.splice(idx, 1);
    } else {
      console.log('\nNo se pudo colocar la criatura, no cumple las condiciones');
      break;
    }
  }

  rivalHand = rivalHand.filter(c => !usedCards.includes(c._id));

  console.log('\nCartas utilizadas:', usedCards);
  console.log('\nMesa del rival actualizada:', rivalTable);
  console.log('\nMesa del jugador actualizada:', playerTable);
  console.log('\nMana del rival actualizado:', rivalMana);

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
  console.log('\nCartas colocadas en la mesa y actualizadas en la base de datos');
}

async function changeCardsPositionToAttack(game) {
  const gameUpdated = await Game.findById(game._id);
  if (!gameUpdated) {
    throw new Error('Game not found');
  }

  let rivalTable = null;
  if (gameUpdated.rivalTable.length > 0) {
    rivalTable = gameUpdated.rivalTable.map(card => ({
      ...card.toObject() || card,
      position: 'attack'
    }));
  } else {
    rivalTable = [];
  }

  let playerTable = null;
  if (gameUpdated.playerTable.length > 0) {
    playerTable = gameUpdated.playerTable.map(card => ({
      ...card.toObject() || card,
      position: 'defense'
    }));
  } else {
    playerTable = [];
  }

  await Game.updateOne(
    { _id: gameUpdated._id },
    {
      $set: {
        rivalTable,
        playerTable
      }
    }
  );
}

module.exports = { placeCards, changeCardsPositionToAttack };
