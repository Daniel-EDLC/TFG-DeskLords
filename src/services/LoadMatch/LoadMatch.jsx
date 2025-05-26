// import mockData from '../../../public/mockCalls/useLoadMatchMock.json';

import { useEffect, useState } from 'react';

 export default function useLoadMatch(onDataReady) {
   const [gameData, setGameData] = useState(null);

   useEffect(() => {
     const fetchGameData = async () => {
       const payload = {
        playerId: "680d1b6f3f11cda356ec54f1",
        map: { id: "683498b5985f7d2718edf693" },
        user: { deck: { id: "683497e1a61c67ad15a141cf" } }
       };
       try {
         const response = await fetch('http://localhost:3000/api/startGame', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(payload)
         });

         const data = await response.json();
         console.log("Datos del juego obtenidos:", data.data);
         setGameData(data.data);
         if (onDataReady) onDataReady(data.data);
       } catch (error) {
         console.error("Error al obtener datos del juego:", error);
       }
     };

     fetchGameData();
   }, [onDataReady]);

   return [gameData, setGameData];
 }



// export default function useLoadMatch() {
//   const [data, setData] = useState(null);

//   useEffect(() => {
//     setTimeout(() => {
//       setData(mockData);
//     }, 500);
//   }, []);

//   return [data, setData];
// }




