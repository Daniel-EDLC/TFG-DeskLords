import { useEffect, useState } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../../firebaseConfig";

function GamesList() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    fetchGames();
  }, []);

  async function getUserToken() {
    const user = await new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        if (user) resolve(user);
        else reject(new Error("Usuario no autenticado"));
      });
    });
    return user.getIdToken();
  }

  async function fetchGames() {
    try {
      const token = await getUserToken();
      const res = await fetch(`https://api-meafpnv6bq-ew.a.run.app/api/getGames`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setGames(data.data.games);
    } catch (error) {
      console.error('Error al obtener partidas:', error);
    }
  }

  async function deleteGame(id) {
    try {
      const token = await getUserToken();
      const res = await fetch(`https://api-meafpnv6bq-ew.a.run.app/api/deleteGame`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ idGame: id })
      });
      if (res.ok) {
        setGames(games.filter(game => game._id !== id));
      }
    } catch (error) {
      console.error('Error al borrar partida:', error);
    }
  }

  return (
    <div>
      <h2>Lista de Partidas</h2>
      <div className="table-scroll-wrapper">
        <table border="1" cellPadding="8" cellSpacing="0">
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
    </div>
  );
}

export default GamesList;
