
// version real playCard

// export async function playCard(setGameData, card) {
//   let body = {};

//   switch (card.type) {
//     case "criature":
//       console.log("criatura sacada" + card.targetId );
//       body = {
//         id: card.id,
//         type: "criature"
//       };
//       break;

//     case "spell":
//       console.log("hechizo sacada" + card.targetId);
//       body = {
//         type: "spell",
//         action: {
//           type: "kill", 
//           target: [{ id: card.id }]
//         }
//       };
//       break;

//     case "equipement":
//       console.log("equipo sacada" + card.targetId);
//       body = {
//         id: card.id,
//         type: "equipement",
//         action_result: {
//           type: "use"
//         },
//         target: {
//           id: card.targetId
//         }
//       };
//       break;

//     default:
      
//       return;
//   }

//   try {
//     const response = await fetch(
//       'https://fd167768-d9ff-4c53-ac9d-93f430094cf7.mock.pstmn.io/games/1111/cards/use',
//       {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(body),
//       }
//     );

//     if (!response.ok) throw new Error('Fallo en la acción de juego');

//     const result = await response.json();

//     setGameData(prev => ({
//       ...prev,
//       user: {
//         ...prev.user,
//         ...result.user,
//       }
      
//     }));
      
//   } catch (error) {
//     console.error('Error al jugar la carta:', error);
//   }
// }




// version mock playCard

import criatureResponse from '../../../public/mockCalls/criatureResponse.json';
import spellResponse from '../../../public/mockCalls/spellResponse.json';
import equipementResponse from '../../../public/mockCalls/equipementResponse.json';


export async function playCard(setGameData, card) {
  // let body = {};

  switch (card.type) {
    case "criature":
      // body = { id: card.id, type: "criature" };
      break;

    case "spell":
      // body = {
      //   type: "spell",
      //   action: { type: "kill", target: [{ id: card.id }] }
      // };
      break;

    case "equipement":
      // body = {
      //   id: card.id,
      //   type: "equipement",
      //   action_result: { type: "use" },
      //   target: { id: card.targetId }
      // };
      break;

    default:
      return;
  }

  try {
    await new Promise(res => setTimeout(res, 500)); // Simula delay

    let simulatedResponse;
    switch (card.type) {
      case "criature":
        simulatedResponse = criatureResponse;
        break;
      case "spell":
        simulatedResponse = spellResponse;
        break;
      case "equipement":
        simulatedResponse = equipementResponse;
        break;
    }

    setGameData(prev => ({
      ...prev,
      user: {
        ...prev.user,
        ...simulatedResponse.user
      }
    }));

  } catch (error) {
    console.error("Error simulado al jugar carta:", error);
  }
}










// version real switchPhase


// export async function switchPhase(setGameData) {
//   try {
//       const response = await fetch('https://fd167768-d9ff-4c53-ac9d-93f430094cf7.mock.pstmn.io/games/1111/end_phase', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         }
//       });
  
//       if (!response.ok) throw new Error('Fallo en la acción de juego');
  
//       const result = await response.json();
  
     
//       setGameData(prev => ({
//         ...prev,
//         turn: {
//           ...prev.turn,
//           ...result.turn,
//         }
//       }));
  
//     } catch (error) {
//       console.error('Error al cambiar phase:', error);
//     }
// }



// version mock switchPhase



import switchPhaseResponse from '../../../public/mockCalls/switchPhase.json';

export async function switchPhase(setGameData) {
  try {
    // Simula retardo
    await new Promise(res => setTimeout(res, 300));

    const result = switchPhaseResponse;

    setGameData(prev => ({
      ...prev,
      turn: {
        ...prev.turn,
        ...result.turn,
      }
    }));

  } catch (error) {
    console.error('Error simulado al cambiar phase:', error);
  }
}











//version real attack

// export async function attack(selectedAttackCards) {
//     // Formatea las cartas como espera el backend
//     const payload = {
//       cards: selectedAttackCards.map(id => ({ id })),
//     };

//     try {
//       const response = await fetch('/api/attack', { // Cambia la URL a la correcta
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(payload),
//       });

//       if (!response.ok) {
//         throw new Error('Error al hacer el ataque');
//       }

//       const data = await response.json();
//       console.log('Respuesta del servidor:', data);

     
//     } catch (error) {
//       console.error('Error al enviar ataque:', error);
//     }
// };






// export async function attack(selectedAttackCards, setGameData) {
//   const payload = {
//     cards: selectedAttackCards.map(id => ({ id })),
//   };

//   try {
//     const response = await fetch('/api/attack', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(payload),
//     });

//     if (!response.ok) {
//       throw new Error('Error al hacer el ataque');
//     }

//     const data = await response.json();
//     console.log('Respuesta del servidor:', data);

//     // ✅ Actualizar user completo
//     setGameData(prev => ({
//       ...prev,
//       user: {
//         ...prev.user,
//         ...data.user
//       },
//       turn: {
//         ...prev.turn,
//         ...data.turn
//       }
//     }));

//   } catch (error) {
//     console.error('Error al enviar ataque:', error);
//   }
// }





//version mock attack

import attackResponse from '../../../public/mockCalls/attackResponse.json';



export async function attack(selectedAttackCards, setGameData) {
  // const payload = {
  //   cards: selectedAttackCards.map(id => ({ id })),
  // };

  try {
    await new Promise(res => setTimeout(res, 300)); // Simula una llamada async

    const data = attackResponse;
    console.log('Respuesta simulada del ataque:', data);

    setGameData(prev => ({
      ...prev,
      turn: {
        ...prev.turn,
        ...data.action1.turn,
      },
      user: {
        ...prev.user,
        ...data.action1.user,
      },
      rival: {
        ...prev.rival,
        ...data.action1.rival,
      }
    }));


    setTimeout(() => {
      setGameData(prev => ({
        ...prev,
        turn: {
          ...prev.turn,
          ...data.action2.turn,
        },
        user: {
          ...prev.user,
          ...data.action2.user,
        },
        rival: {
          ...prev.rival,
          ...data.action2.rival,
        }
      }));
    }, 3000);

    setTimeout(() => {
        setGameData(prev => ({
        ...prev,
        turn: {
          ...prev.turn,
          ...data.action3.turn,
        },
        user: {
          ...prev.user,
          ...data.action3.user,
        },
        rival: {
          ...prev.rival,
          ...data.action3.rival,
        }
      }));
    }, 6000);



  } catch (error) {
    console.error('Error simulado al enviar ataque:', error);
  }
}




//funciones necesarias para batalla



let battle = [];

let pendingFight = {
  atacanteId: null,
  defensorId: null
};

export function resetBattle() {
  battle = [];
  pendingFight = { atacanteId: null, defensorId: null };
}
export function resetPendingFight() {
  pendingFight = { atacanteId: null, defensorId: null };
}

export function getBattle() {
  return battle;
}
export function getFight() {
  return pendingFight;
}

export function addCardToBattle(carta) {
  
  console.log('Intentando', carta.id);
  const fight = getFight();
  if (fight.atacanteId === carta.id || fight.defensorId === carta.id) {
    console.log('La carta ya estaba seleccionada, selección reiniciada');
    resetPendingFight();
    if (carta.battle) {
      delete carta.battle;
    }
    return null;
  }

  if (carta.battle === true) {
    alert('la carta ya esta declarada en batalla');
    return null;
  }

  const esAtacante = carta.position === 'attack';
  const esDefensor = carta.position === 'defense';

  if (!esAtacante && !esDefensor){
    alert('La carta no es ni atacante ni defensor');
    return null;
  }

  if (esAtacante && pendingFight.atacanteId !== null){
    alert('Ya hay una carta asignada como atacante, debes seleccionar un defensor');
    return null;
  }else if(esDefensor && pendingFight.defensorId !== null) {
    alert('Ya hay una carta asignada como defensor, debes seleccionar un atacante');
    return null;
  }

  if (esAtacante) {
    pendingFight.atacanteId = carta.id;
    carta.battle = true;
    console.log("Atacante asignado:", carta.id);
  } else if (esDefensor) {
    pendingFight.defensorId = carta.id;
    carta.battle = true;
    console.log("Defensor asignado:", carta.id);
  }

  if (pendingFight.atacanteId && pendingFight.defensorId) {
    const fight = {
      atacanteId: pendingFight.atacanteId,
      defensorId: pendingFight.defensorId
    };

    battle.push(fight);
    console.log('Pelea añadida:', fight);
    console.log('Estado de la batalla:', battle);

    pendingFight = {
      atacanteId: null,
      defensorId: null
    };

    return fight;
  }

  return null;
}








// version mock / real defense

import defenseResponse from '../../../public/mockCalls/defenseResponse.json';


export async function defense(setGameData, gameData) {

  const battle = getBattle();
  const attackers = gameData.rival.table.filter(carta => carta.position === 'attack');
  console.log('Estado de la batalla:', battle);
  console.log('Atacantes:', attackers);

  const idsEnBatalla = battle.map(b => b.atacanteId);

  const nuevosAtacantes = attackers.filter(a => !idsEnBatalla.includes(a.id));

  const nuevasEntradas = nuevosAtacantes.map(a => ({
    atacanteId: a.id,
    defensorId: '0'
  }));

  const nuevaBatalla = [...battle, ...nuevasEntradas];

  console.log('batalla final:', nuevaBatalla);
 
  // const payload = {
  //   cards: selectedDefenseCard.map(id => ({ id })),
  // };

  try {
    await new Promise(res => setTimeout(res, 300)); // Simula una llamada async

    const data = defenseResponse;
    console.log('Respuesta simulada de la defensa:', data);

    setGameData(prev => ({
      ...prev,
      turn: {
        ...prev.turn,
        ...data.turn,
      },
      user: {
        ...prev.user,
        ...data.user,
      },
      rival: {
        ...prev.rival,
        ...data.rival,
      }
    }));

  } catch (error) {
    console.error('Error simulado al enviar defensa:', error);
  }
}








export async function endTurn() {
 console.log('turno acabado');
}

