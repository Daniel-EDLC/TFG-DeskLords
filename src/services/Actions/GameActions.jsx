import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../firebaseConfig";
//  version real playCard

export async function playCard(setGameData, gameData, card) {
  console.log("jugando carta ->",card)
  const user = await new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) resolve(user);
      else reject(new Error("Usuario no autenticado"));
    });
  });
  const userToken = await user.getIdToken();

  let payload = {};
  switch (card.type) {
    case "creature":
      payload = {
        gameId: gameData.gameId,
        playerId: user.uid,
        cardId: card._id,
        type: "creature",
      };
      break;

    case "spell":
      payload = {
        gameId: gameData.gameId,
        playerId: user.uid,
        cardId: card._id,
        type: "spell",
        target: { id: card.targetId },
      };
      break;

    case "equipement":
      payload = {
        gameId: gameData.gameId,
        playerId: user.uid,
        cardId: card._id,
        type: "equipement",
        target: { id: card.targetId },
      };
      break;

    default:
      break;
  }
  try {
    const response = await fetch("https://api-meafpnv6bq-ew.a.run.app/api/useCard", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Fallo en la acción de juego");

    const result = await response.json();
    console.log("Respuesta del servidor:", result);
    setGameData((prev) => ({
  ...prev,
  rival: result.data.rival,
  user: result.data.user,
  turn: result.data.turn
}));
  } catch (error) {
    console.error("Error al jugar la carta:", error);
  }
}

// version mock playCard

/*
import criatureResponse from '../../../public/mockCalls/criatureResponse.json';
import spellResponse from '../../../public/mockCalls/spellResponse.json';
import equipementResponse from '../../../public/mockCalls/equipementResponse.json';


export async function playCard(setGameData, card) {
  let body = {};

  switch (card.type) {
    case "criature":
      body = { id: card._id, type: "criature" };
      break;

    case "spell":
      body = {
        type: "spell",
        action: { type: "kill", target: [{ id: card._id }] }
      };
      break;

    case "equipement":
      body = {
        id: card._id,
        type: "equipement",
        action_result: { type: "use" },
        target: { id: card.targetId }
      };
      break;

    default:
      return;
  }

  try {
    await new Promise(res => setTimeout(res, 500)); 

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
  */

// version real switchPhase ---------------------------------------------------------------------------------------------------------------------------------------------

export async function switchPhase(setGameData, gameData) {
  const user = await new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) resolve(user);
      else reject(new Error("Usuario no autenticado"));
    });
  });
  const userToken = await user.getIdToken();

  const payload = {
    playerId: user.uid,
    gameId: gameData.gameId,
    turn:{ phase: gameData.turn.phase}
  };

  try {
    const response = await fetch("https://api-meafpnv6bq-ew.a.run.app/api/switchPhase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Fallo en la acción de juego");

    const result = await response.json();

    setGameData((prev) => ({
      ...prev,
      turn: {
        ...prev.turn,
        ...result.data.turn,
      },
    }));
  } catch (error) {
    console.error("Error al cambiar phase:", error);
  }
}

// version mock switchPhase

/*
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
}*/

//funciones necesarias para batalla

let battle = [];

let pendingFight = {
  atacanteId: null,
  defensorId: null,
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
  console.log("Intentando", carta._id);
  const fight = getFight();
  if (fight.atacanteId === carta._id || fight.defensorId === carta._id) {
    console.log("La carta ya estaba seleccionada, selección reiniciada");
    resetPendingFight();
    // if (carta.battle) {
    //   delete carta.battle;
    // }
    return null;
  }

  const esAtacante = carta.position === "attack";
  const esDefensor = carta.position === "defense";

  if (!esAtacante && !esDefensor) {
    alert("La carta no es ni atacante ni defensor");
    return null;
  }

  const activeBattle = battle.some(
    (pelea) => pelea.atacanteId === carta._id || pelea.defensorId === carta._id
  );

  if (activeBattle) {
    alert("La carta ya forma parte de una batalla confirmada");
    return null;
  }
  // if (carta.battle === true) {
  //   alert('la carta ya esta declarada en batalla');
  //   return null;
  // }
  if (esAtacante && pendingFight.atacanteId !== null) {
    alert(
      "Ya hay una carta asignada como atacante, debes seleccionar un defensor"
    );
    return null;
  } else if (esDefensor && pendingFight.defensorId !== null) {
    alert(
      "Ya hay una carta asignada como defensor, debes seleccionar un atacante"
    );
    return null;
  }

  if (esAtacante) {
    pendingFight.atacanteId = carta._id;
    carta.battle = true;
    console.log("Atacante asignado:", carta._id);
  } else if (esDefensor) {
    pendingFight.defensorId = carta._id;
    carta.battle = true;
    console.log("Defensor asignado:", carta._id);
  }

  if (pendingFight.atacanteId && pendingFight.defensorId) {
    const fight = {
      atacanteId: pendingFight.atacanteId,
      defensorId: pendingFight.defensorId,
    };
    battle.push(fight);
    console.log("Pelea añadida:", fight);
    console.log("Estado de la batalla:", battle);
    pendingFight = {
      atacanteId: null,
      defensorId: null,
    };
    return fight;
  }

  return null;
}

// version mock attack---------------------------------------------------------------------------------------------------------------------------------------------
/*
 export async function attack(selectedAttackCards) {
     const payload = {
       cards: selectedAttackCards.map(id => ({ id })),
     };

     try {
       const response = await fetch('/api/attack', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify(payload),
       });

       if (!response.ok) {
         throw new Error('Error al hacer el ataque');
       }

       const data = await response.json();

     
     } catch (error) {
       console.error('Error al enviar ataque:', error);
     }
 };*/

/*
export async function attack(selectedAttackCards, setGameData) {
  const payload = {
    cards: selectedAttackCards.map(id => ({ id })),
  };

  try {
    const response = await fetch('/api/attack', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Error al hacer el ataque');
    }

    const data = await response.json();

    setGameData(prev => ({
      ...prev,
      user: {
        ...prev.user,
        ...data.user
      },
      turn: {
        ...prev.turn,
        ...data.turn
      }
    }));

  } catch (error) {
    console.error('Error al enviar ataque:', error);
  }
}
*/

//version real attack

export async function endTurn(selectedAttackCards, setGameData, gameData, setFloatingMessage) {

 const user = await new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) resolve(user);
      else reject(new Error("Usuario no autenticado"));
    });
  });
  const userToken = await user.getIdToken();

  

  const payload = {
    playerId: user.uid,
    gameId: gameData.gameId,
    cards: selectedAttackCards.map((id) => ({ id })),
  };

  try {
    const response = await fetch("https://api-meafpnv6bq-ew.a.run.app/api/attack", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Error al finalizar el turno");
    }

    const data = await response.json();
    
    console.log(data);


        if (data.data.battle === true) {
          console.log("defensa del rival");
          console.log(data.data);

          setGameData((prev) => ({
            ...prev,
            turn: { ...prev.turn, ...data.data.action1.turn },
            user: { ...prev.user, ...data.data.action1.user },
            rival: { ...prev.rival, ...data.data.action1.rival },
          }));
          setTimeout(() => {
            console.log("mano del rival");
            console.log(data.data);

            setGameData((prev) => ({
              ...prev,
              turn: { ...prev.turn, ...data.data.action2.turn },
              user: { ...prev.user, ...data.data.action2.user },
              rival: { ...prev.rival, ...data.data.action2.rival },
            }));
          }, 5000);
          setTimeout(() => {
            console.log("ataque del rival");
            console.log(data.data);

            setGameData((prev) => {
              const newGameData = {
                ...prev,
                turn: { ...prev.turn, ...data.data.action3.turn },
                user: { ...prev.user, ...data.data.action3.user },
                rival: { ...prev.rival, ...data.data.action3.rival },
              };

              const userTable = newGameData.user.table;
                const rivalTable = newGameData.rival.table;

                const hayAtacantes = rivalTable?.some(carta => carta.position === "attack");

                if ((!userTable || userTable.length === 0) && hayAtacantes) {
                  setTimeout(() => {
                    setFloatingMessage('Daño automático, no hay criaturas en mesa');
                  }, 2000);

                  setTimeout(() => {
                    defense(setGameData, newGameData);
                  }, 2000);
                }

                if ((hayAtacantes.length <= 0)) {
                  setTimeout(() => {
                    setFloatingMessage('no se han declarado atacantes');
                  }, 2000);

                  setTimeout(() => {
                    defense(setGameData, newGameData);
                  }, 2000);
                }


              return newGameData;
            });
          }, 10000);

        } else {
          console.log("mano del rival (sin acción 1)");
          console.log(data.data);

          setGameData((prev) => ({
            ...prev,
            turn: { ...prev.turn, ...data.data.action2.turn },
            user: { ...prev.user, ...data.data.action2.user },
            rival: { ...prev.rival, ...data.data.action2.rival },
          }));

          setTimeout(() => {
            console.log("ataque del rival");
            console.log(data.data);

            setGameData((prev) => {
              const newGameData = {
                ...prev,
                turn: { ...prev.turn, ...data.data.action3.turn },
                user: { ...prev.user, ...data.data.action3.user },
                rival: { ...prev.rival, ...data.data.action3.rival },
              };

             const userTable = newGameData.user.table;
              const rivalTable = newGameData.rival.table;

              const hayAtacantes = rivalTable?.some(carta => carta.position === "attack");

              if ((!userTable || userTable.length === 0) && hayAtacantes) {
                setTimeout(() => {
                  setFloatingMessage('Daño automático, no hay criaturas en mesa');
                }, 2000);

                setTimeout(() => {
                  defense(setGameData, newGameData);
                }, 2000);
              }


                if ((!hayAtacantes)) {
                  setTimeout(() => {
                    setFloatingMessage('no se han declarado atacantes');
                  }, 2000);

                  setTimeout(() => {
                    defense(setGameData, newGameData);
                  }, 2000);
                }

              return newGameData;
            });
          }, 5000);
        }



    
  } catch (error) {
    console.error("Error simulado al enviar ataque:", error);
  }
}

// version mock defense---------------------------------------------------------------------------------------------------------------------------------------------------
/*
import defenseResponse from '../../../public/mockCalls/defenseResponse.json';


export async function defense(setGameData, gameData) {

  const battle = getBattle();
  const attackers = gameData.rival.table.filter(carta => carta.position === 'attack');

  const idsEnBatalla = battle.map(b => b.atacanteId);

  const nuevosAtacantes = attackers.filter(a => !idsEnBatalla.includes(a._id));

  const nuevasEntradas = nuevosAtacantes.map(a => ({
    atacanteId: a._id,
    defensorId: '0'
  }));

  const batallaFinal = [...battle, ...nuevasEntradas];

  resetBattle();
 
  

  try {
    await new Promise(res => setTimeout(res, 300)); // Simula una llamada async

    const data = defenseResponse;

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
}*/

// version real defense

export async function defense(setGameData, gameData) {
  
  const battle = getBattle();
  const attackers = gameData.rival.table.filter(
    (carta) => carta.position === "attack"
  );

  const idsEnBatalla = battle.map((b) => b.atacanteId);
  const nuevosAtacantes = attackers.filter(
    (a) => !idsEnBatalla.includes(a._id)
  );

  const nuevasEntradas = nuevosAtacantes.map((a) => ({
    atacanteId: a._id,
    defensorId: "player",
  }));

  const batallaFinal = [...battle, ...nuevasEntradas];

  console.log("Batalla que se va a enviar:", batallaFinal);
  resetBattle();


 const user = await new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) resolve(user);
      else reject(new Error("Usuario no autenticado"));
    });
  });
  const userToken = await user.getIdToken();

  const payload = {
    playerId: user.uid,
    gameId: gameData.gameId,
    battles: batallaFinal,
  };

  try {
    const response = await fetch("https://api-meafpnv6bq-ew.a.run.app/api/defend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Error al enviar la defensa");
    }

    const data = await response.json();
    console.log("Respuesta del backend (defensa):", data);

    setGameData((prev) => ({
      ...prev,
      turn: {
        ...prev.turn,
        ...data.data.turn,
      },
      user: {
        ...prev.user,
        ...data.data.user,
      },
      rival: {
        ...prev.rival,
        ...data.data.rival,
      },
    }));
  } catch (error) {
    console.error("Error real al enviar defensa:", error);
  }
}


export async function onSurrender(gameData) {

 const user = await new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) resolve(user);
      else reject(new Error("Usuario no autenticado"));
    });
  });
  const userToken = await user.getIdToken();

  try {
    const payload = {
      playerId: user.uid,
      idpartida: gameData._idpartida,
    };

    const response = await fetch("https://api-meafpnv6bq-ew.a.run.app/api/surrender", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Error al rendirse");
    }

    const result = await response.json();
    console.log("Rendición procesada correctamente:", result);
  } catch (error) {
    console.error("Error al enviar rendición:", error);
  }
}



// services/shopService.js
export const buyProduct = async (id, tipo) => {
  const response = await fetch(`/api/tienda/comprar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, tipo }),
  });

  if (!response.ok) {
    throw new Error("Error al comprar el producto");
  }

  return response.json();
};
