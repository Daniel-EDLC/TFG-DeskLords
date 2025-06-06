import { useEffect, useState } from 'react';

function GamesList() {
  const [games, setGames] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchGames();
  }, []);

  async function fetchGames() {
    try {
      const res = await fetch(`https://api-meafpnv6bq-ew.a.run.app/api/getGames`);
      const data = await res.json();
      setGames(data.data.games);
    } catch (error) {
      console.error('Error al obtener partidas:', error);
    }
  }

  async function deleteGame(id) {
    try {
      const res = await fetch(`https://api-meafpnv6bq-ew.a.run.app/api/deleteGame`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );
      if (res.ok) {
        setGames(games.filter(game => game._id !== id));
      }
    } catch (error) {
      console.error('Error al borrar partida:', error);
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Lista de Partidas</h2>
      <table border="1" cellPadding="8" cellSpacing="0" style={{ marginTop: '10px', width: '100%' }}>
        <thead>
          <tr>
            <th>Estado</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Jugador</th>
            <th>HP Jugador</th>
            <th>HP Rival</th>
            <th>Turno</th>
            <th>Ganador</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {games.map(game => (
            <tr key={game._id}>
              <td>{game.status}</td>
              <td>{new Date(game.startTime).toLocaleString()}</td>
              <td>{game.endTime ? new Date(game.endTime).toLocaleString() : '-'}</td>
              <td>{game.playerId}</td>
              <td>{game.playerHp}</td>
              <td>{game.rivalHp}</td>
              <td>{game.currentTurn}</td>
              <td>{game.winner || '-'}</td>
              <td>
                <button onClick={() => deleteGame(game._id)}>Borrar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default GamesList;
