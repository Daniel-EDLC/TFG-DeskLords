import { auth } from '../../../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';



// version mock cargaInformacion


// import Informacion from '../../../public/mockCalls/info.json';

export async function cargaInformacion() {

  try {
      const user = await new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          unsubscribe();
          if (user) resolve(user);
          else reject(new Error('Usuario no autenticado'));
        });
      });
     const userToken = await user.getIdToken();
     console.log(user)
     const payload = {
       playerId: user.uid
     }
     console.log(payload)
     const response = await fetch('https://api-meafpnv6bq-ew.a.run.app/api/getPlayerInfo', { 
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${userToken}`
       },
       body: JSON.stringify(payload)
     });

     if (!response.ok) {
       throw new Error('No se pudo obtener la información del juego');
     }

     const data = await response.json();
    //  const data = response;
    //  console.log(Informacion)
     return data.data;
    // return Informacion;

  } catch (error) {
    console.error('Error al cargar la información:', error);
    throw error;
  }
}




// version real llamarPartida

// import InformacionPartida from '../../../public/mockCalls/infoPartida.json';


// export const cargarPartida = async (deckId, mapa) => {
//   try {
//     const response = await fetch('http://localhost:8080/api/gmae', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({
//         deckId: deckId,
//         mapaId: mapa._id,
//         mapaNombre: mapa.nombre
//       })
//     });

//     if (!response.ok) {
//       throw new Error('No se pudo iniciar la partida');
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Error al iniciar partida:', error);
//     throw error;
//   }
// };

// export async function cargarPartida  (deckId, map) {

// console.log("deckId:", deckId)
// console.log("mapa:", map)


// useLoadMatch(deckId, map._id);
// };

export async function cargarPartida(deckId, mapId) {
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
    map: { id: mapId },
    user: { deck: { id: deckId } }
  };

  const response = await fetch("https://api-meafpnv6bq-ew.a.run.app/api/startGame", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken}`
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  return data.data;
}






//version real decks
// import mazos from '../../../public/mockCalls/decks.json';


/*
export const getDecks = async (userId) => {
  try {
    const response = await fetch(`/api/decks/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener los decks');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en getDecks:', error);
    throw error;
  }
};*/

// export const getDecks = async () => {
//   try {
//     const response = await fetch('../../../public/mockCalls/decks.json');
//     if (!response.ok) {
//       throw new Error('Error al obtener los decks');
//     }

//     const data = await response.json();

//     // Si quieres filtrar por userId, puedes hacerlo aquí si el JSON lo soporta
//     // return data.filter(deck => deck.userId === userId);
    
//     return data;
//   } catch (error) {
//     console.error('Error en getDecks:', error);
//     throw error;
//   }
// };




