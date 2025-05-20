import mockData from '../../mockCalls/useLoadMatchMock.json';

import { useEffect, useState } from 'react';

// export function useLoadMatch(onDataReady) {
//   const [gameData, setGameData] = useState(null);

//   useEffect(() => {
//     const fetchGameData = async () => {
//       const payload = {
//         map: { id: "map_a0ea77ea-e28c-4c57-be6d-63d34c63696a" },
//         user: { deck: { id: "dck_47690572-f6e3-4d2b-9472-77e75ca83c41" } }
//       };
//       try {
//         const response = await fetch('https://fd167768-d9ff-4c53-ac9d-93f430094cf7.mock.pstmn.io/games', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(payload)
//         });

//         const data = await response.json();
//         setGameData(data);
//         if (onDataReady) onDataReady(data);
//       } catch (error) {
//         console.error("Error al obtener datos del juego:", error);
//       }
//     };

//     fetchGameData();
//   }, [onDataReady]);

//   return [gameData, setGameData];
// }



export default function useLoadMatch() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Simula un fetch
    setTimeout(() => {
      setData(mockData);
    }, 500);
  }, []);

  return [data, setData];
}




