import { useEffect, useState } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../../firebaseConfig";

function SetsList() {
  const [sets, setSets] = useState([]);
  const [editingSet, setEditingSet] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState(getEmptyForm());

  function getEmptyForm() {
    return {
      name: '',
      description: ''
    };
  }

  useEffect(() => {
    fetchSets();
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

  async function fetchSets() {
    try {
      const token = await getUserToken();
      const res = await fetch(`https://api-meafpnv6bq-ew.a.run.app/api/getSets`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setSets(data.data.sets);
    } catch (error) {
      console.error('Error al obtener sets:', error);
    }
  }

  async function deleteSet(id) {
    try {
      const token = await getUserToken();
      const res = await fetch(`https://api-meafpnv6bq-ew.a.run.app/api/deleteSet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ idSet: id })
      });
      if (res.ok) {
        setSets(sets.filter(s => s._id !== id));
      }
    } catch (error) {
      console.error('Error al borrar set:', error);
    }
  }

  async function saveSet(e) {
    e.preventDefault();
    const isEdit = !!editingSet;

    try {
      const token = await getUserToken();
      const url = isEdit
        ? `https://api-meafpnv6bq-ew.a.run.app/api/updateSet`
        : `https://api-meafpnv6bq-ew.a.run.app/api/createSet`;

      const payload = isEdit
        ? { idSet: editingSet._id, data: formData }
        : formData;
      const method= isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await fetchSets();
        setEditingSet(null);
        setIsCreating(false);
        setFormData(getEmptyForm());
      }
    } catch (error) {
      console.error('Error al guardar set:', error);
    }
  }

  function openEdit(set) {
    setEditingSet(set);
    setIsCreating(false);
    setFormData({
      name: set.name || '',
      description: set.description || ''
    });
  }

  return (
    <div>
      <h2>Lista de Sets</h2>
      <button onClick={() => { setIsCreating(true); setFormData(getEmptyForm()); setEditingSet(null); }}>
        + Nuevo Set
      </button>
      <div className="table-scroll-wrapper">
        <table border="1" cellPadding="8" cellSpacing="0">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Fecha de Lanzamiento</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sets.map(set => (
              <tr key={set._id}>
                <td>{set.name}</td>
                <td>{set.description || '-'}</td>
                <td>{new Date(set.release_date).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => openEdit(set)}>Editar</button>
                  <button onClick={() => deleteSet(set._id)}>Borrar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(editingSet || isCreating) && (
        <div className="modal-overlay">
          <form onSubmit={saveSet}>
            <h3>{editingSet ? 'Editar Set' : 'Nuevo Set'}</h3>

            <label>Nombre:</label>
            <input
              type="text"
              value={formData.name}
              pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$"
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
              title="Solo letras y espacios"
            />

            <label>Descripción (opcional):</label>
            <textarea
              value={formData.description}
              pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$"
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              title="Solo letras y espacios"
            />

            {editingSet && (
              <>
                <label>Fecha de Lanzamiento:</label>
                <input
                  type="text"
                  value={new Date(editingSet.release_date).toLocaleDateString()}
                  readOnly
                />
              </>
            )}

            <br /><br />
            <button type="submit">Guardar</button>
            <button type="button" onClick={() => { setEditingSet(null); setIsCreating(false); }}>
              Cancelar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default SetsList;
