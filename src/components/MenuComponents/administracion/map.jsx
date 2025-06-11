import { useEffect, useState } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../../firebaseConfig";

function MapsList() {
  const [maps, setMaps] = useState([]);
  const [decks, setDecks] = useState([]);
  const [editingMap, setEditingMap] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState(getEmptyForm());

  function getEmptyForm() {
    return {
      name: '',
      description: '',
      image: '',
      element: '',
      deck: ''
    };
  }

  useEffect(() => {
    fetchMaps();
    fetchDecks();
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

  async function fetchMaps() {
    try {
      const token = await getUserToken();
      const res = await fetch(`https://api-meafpnv6bq-ew.a.run.app/api/getMaps`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setMaps(data.data.maps);
    } catch (error) {
      console.error('Error al obtener mapas:', error);
    }
  }

  async function fetchDecks() {
    try {
      const token = await getUserToken();
      const res = await fetch(`https://api-meafpnv6bq-ew.a.run.app/api/getDecks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setDecks(data.data.decks);
    } catch (error) {
      console.error('Error al obtener decks:', error);
    }
  }

  async function deleteMap(id) {
    try {
      const token = await getUserToken();
      const res = await fetch(`https://api-meafpnv6bq-ew.a.run.app/api/deleteMap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ idMap: id })
      });
      if (res.ok) {
        setMaps(maps.filter(map => map._id !== id));
      }
    } catch (error) {
      console.error('Error al borrar mapa:', error);
    }
  }

  async function saveMap(e) {
    e.preventDefault();
    const isEdit = !!editingMap;

    try {
      const token = await getUserToken();
      const url = isEdit
        ? `https://api-meafpnv6bq-ew.a.run.app/api/updateMap`
        : `https://api-meafpnv6bq-ew.a.run.app/api/createMap`;
      const method = isEdit ? 'PUT' : 'POST';

      const basePayload = {
        ...formData,
        deckId: formData.deck
      };
      delete basePayload.deck;

      const payload = isEdit
        ? { idMap: editingMap._id, data: basePayload }
        : basePayload;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await fetchMaps();
        setEditingMap(null);
        setIsCreating(false);
        setFormData(getEmptyForm());
      }
    } catch (error) {
      console.error('Error al guardar mapa:', error);
    }
  }

  function openEdit(map) {
    setEditingMap(map);
    setIsCreating(false);
    setFormData({
      name: map.name || '',
      description: map.description || '',
      image: map.image || '',
      element: map.element || '',
      deck: typeof map.deck === 'string' ? map.deck : map.deck?._id || ''
    });
  }

  return (
    <div>
      <h2>Lista de Mapas</h2>
      <button onClick={() => { setIsCreating(true); setFormData(getEmptyForm()); setEditingMap(null); }}>
        + Nuevo Mapa
      </button>
      <div className="table-scroll-wrapper">
        <table border="1" cellPadding="8" cellSpacing="0">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Elemento</th>
              <th>Deck</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {maps.map(map => (
              <tr key={map._id}>
                <td>{map.name}</td>
                <td>{map.element || '-'}</td>
                <td>{map.deck?.name || '-'}</td>
                <td>
                  <button onClick={() => openEdit(map)}>Editar</button>
                  <button onClick={() => deleteMap(map._id)}>Borrar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(editingMap || isCreating) && (
        <div className="modal-overlay">
          <form onSubmit={saveMap}>
            <h3>{editingMap ? 'Editar Mapa' : 'Nuevo Mapa'}</h3>

            <label>Nombre:</label>
            <input
              type="text"
              value={formData.name}
              pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$"
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
              title="Solo letras y espacios"
            />

            <label>Descripción:</label>
            <input
              type="text"
              value={formData.description}
              pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$"
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              required
              title="Solo letras y espacios"
            />

            <label>Imagen (opcional):</label>
            <input
              type="text"
              value={formData.image}
              onChange={e => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://ejemplo.com/imagen.png"
            />

            <label>Elemento (opcional):</label>
            <input
              type="text"
              pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$"
              value={formData.element}
              onChange={e => setFormData({ ...formData, element: e.target.value })}
              title="Solo letras y espacios"
            />

            <label>Deck:</label>
            <select
              value={formData.deck}
              onChange={e => setFormData({ ...formData, deck: e.target.value })}
              required
            >
              <option value="" disabled>-- Selecciona un deck --</option>
              {decks.map(deck => (
                <option key={deck._id} value={deck._id}>
                  {deck.name}
                </option>
              ))}
            </select>

            <br /><br />
            <button type="submit">Guardar</button>
            <button
              type="button"
              onClick={() => { setEditingMap(null); setIsCreating(false); }}
            >
              Cancelar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default MapsList;
