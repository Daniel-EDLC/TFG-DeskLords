// version mock cargaInformacion


 import Informacion from '../../../public/mockCalls/info.json';


 export async function cargaInformacion() {


   try {
     await new Promise(res => setTimeout(res, 300));

     const data = Informacion;
     console.log('Respuesta simulada de la carga:');

     return data;

   } catch (error) {
     console.error('Error simulado al enviar defensa:', error);
   }
 }



// version real llamarPartida

import InformacionPartida from '../../../public/mockCalls/infoPartida.json';


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
    const response = await fetch('/mockCalls/infoPartida.json');

    if (!response.ok) {
      throw new Error('No se pudo cargar el mock de partida');
    }

    const data = await response.json();
    console.log('Mock de partida cargado correctamente:', data);
    return data;
  } catch (error) {
    console.error('Error al cargar partida mock:', error);
    throw error;
  }
};

