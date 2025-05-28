// version mock cargaInformacion


// import Informacion from '../../../public/mockCalls/info.json';

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

    const data = await response.json();
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


