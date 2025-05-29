// version mock cargaInformacion


import Informacion from '../../../public/mockCalls/info.json';

export async function cargaInformacion() {
  try {
    const response = await fetch('/api/infoUser', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Si tu backend requiere autenticación, puedes añadir aquí el token
        // 'Authorization': `Bearer ${tuToken}`
      }
    });

    if (!response.ok) {
      throw new Error('No se pudo obtener la información del juego');
    }

    // const data = await response.json();
    const data = Informacion;
    return data;

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
//         mapaId: mapa.id,
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

export const cargarPartida = async (deckId, mapa) => {
  try {
    const response = await fetch('/api/startGame', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deckId: deckId,
        mapaId: mapa.id,
      }),
    });

    if (!response.ok) {
      throw new Error('No se pudo iniciar la partida');
    }

    const data = await response.json();
    console.log('Partida iniciada correctamente:', data);
    return data;
  } catch (error) {
    console.error('Error al iniciar partida:', error);
    throw error;
  }
};


//version real decks
import mazos from '../../../public/mockCalls/decks.json';

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

export const getDecks = async () => {
  try {
    const response = await fetch('../../../public/mockCalls/decks.json'); // sin `${userId}` si no filtras
    if (!response.ok) {
      throw new Error('Error al obtener los decks');
    }

    const data = await response.json();

    // Si quieres filtrar por userId, puedes hacerlo aquí si el JSON lo soporta
    // return data.filter(deck => deck.userId === userId);
    
    return data;
  } catch (error) {
    console.error('Error en getDecks:', error);
    throw error;
  }
};




