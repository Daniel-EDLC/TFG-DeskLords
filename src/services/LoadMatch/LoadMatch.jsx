import { useEffect, useState } from "react";
import { cargarPartida } from "../../services/Actions/MenuActions";

export default function useLoadMatch(deckId, mapId, onDataReady) {
  const [gameData, setGameData] = useState(null);

  useEffect(() => {
    if (!deckId || !mapId) return;

    const fetchData = async () => {
      try {
        const data = await cargarPartida(deckId, mapId);
        setGameData(data);
        if (onDataReady) onDataReady(data);
      } catch (err) {
        console.error("Error al cargar la partida:", err);
      }
    };

    fetchData();
  }, [deckId, mapId, onDataReady]);

  return [gameData, setGameData];
}
