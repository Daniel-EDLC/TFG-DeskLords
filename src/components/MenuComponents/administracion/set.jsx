import { useEffect, useState } from 'react';

function SetsList() {
  const [sets, setSets] = useState([]);
  const [editingSet, setEditingSet] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState(getEmptyForm());

  const API_URL = import.meta.env.VITE_API_URL;

  function getEmptyForm() {
    return {
      name: '',
      description: ''
    };
  }

  useEffect(() => {
    fetchSets();
  }, []);

  async function fetchSets() {
    try {
      const res = await fetch(`https://api-meafpnv6bq-ew.a.run.app/api/getSets`);
      const data = await res.json();
      setSets(data.data.sets);
    } catch (error) {
      console.error('Error al obtener sets:', error);
    }
  }

  async function deleteSet(id) {
    try {
      const res = await fetch(`https://api-meafpnv6bq-ew.a.run.app/api/deleteSet`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );
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
    const url = isEdit
      ? `https://api-meafpnv6bq-ew.a.run.app/api/updateSet`
      : `https://api-meafpnv6bq-ew.a.run.app/api/createSet`;

    const payload = isEdit
      ? { idSet: editingSet._id, data: formData }
      : formData;

    const res = await fetch(url, {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
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
    <div style={{ padding: '20px' }}>
      <h2>Lista de Sets</h2>
      <button onClick={() => { setIsCreating(true); setFormData(getEmptyForm()); setEditingSet(null); }}>
        + Nuevo Set
      </button>
      <table border="1" cellPadding="8" cellSpacing="0" style={{ marginTop: '10px' }}>
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

      {(editingSet || isCreating) && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <form onSubmit={saveSet} style={{
            padding: '20px', borderRadius: '10px',
            width: '90%', maxWidth: '600px'
          }}>
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
            <button type="button" onClick={() => { setEditingSet(null); setIsCreating(false); }} style={{ marginLeft: '10px' }}>
              Cancelar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default SetsList;
