import { useEffect, useState } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../../firebaseConfig";

function BattlePassList() {
  const [battlePasses, setBattlePasses] = useState([]);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    fetchPlayers();
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

  async function fetchPlayers() {
    try {
      const token = await getUserToken();
      const res = await fetch(`https://api-meafpnv6bq-ew.a.run.app/api/getPlayers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (!res.ok || !data?.data?.players) {
        console.error('Error al obtener jugadores:', data);
        return;
      }

      setPlayers(data.data.players);
      fetchBattlePasses(data.data.players, token);
    } catch (error) {
      console.error('Error al obtener jugadores (exception):', error);
    }
  }

  async function fetchBattlePasses(playersList, token) {
  try {
    const battlePassResults = await Promise.all(playersList.map(async (player) => {
      try {
        const res = await fetch(`https://api-meafpnv6bq-ew.a.run.app/api/getBattlePass`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ playerId: player.uid })
        });

        const data = await res.json();

        if (!res.ok || !data?.data?.battlePass) {
          console.warn(`No se encontró Battle Pass para el jugador ${player.uid}:`, data?.error ?? data);
          return null;
        }

        return data.data.battlePass;
      } catch (err) {
        console.error(`Error interno al buscar Battle Pass para ${player.uid}:`, err);
        return null;
      }
    }));

    const filtered = battlePassResults.filter(bp => bp !== null);
    setBattlePasses(filtered);
  } catch (error) {
    console.error('Error general al obtener pases de batalla:', error);
  }
}


  async function deleteBattlePass(playerId) {
    try {
      const token = await getUserToken();
      const res = await fetch(`https://api-meafpnv6bq-ew.a.run.app/api/deleteBattlePass/${playerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setBattlePasses(battlePasses.filter(bp => bp.playerId !== playerId));
      } else {
        const data = await res.json();
        console.error('Error al borrar pase de batalla:', data?.error ?? 'Error desconocido');
      }
    } catch (error) {
      console.error('Error al borrar pase de batalla (exception):', error);
    }
  }

  return (
    <div>
      <h2>Pases de Batalla</h2>
      <table border="1" cellPadding="8" cellSpacing="0">
        <thead>
          <tr>
            <th>Jugador</th>
            <th>Nivel actual</th>
            <th>Niveles totales</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {battlePasses.map(bp => {
            const player = players.find(p => p.uid === bp.playerId);
            return (
              <tr key={bp._id}>
                <td>{player ? player.displayName : bp.playerId}</td>
                <td>{bp.actual_level}</td>
                <td>{bp.levels?.length ?? 0}</td>
                <td>
                  <button onClick={() => deleteBattlePass(bp.playerId)}>Borrar</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default BattlePassList;
