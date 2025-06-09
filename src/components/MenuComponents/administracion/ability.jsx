import { useEffect, useState } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../../firebaseConfig";

function AbilitiesList() {
  const [abilities, setAbilities] = useState([]);
  const [editingAbility, setEditingAbility] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchAbilities();
  }, []);

  async function getUserToken() {
    const user = await new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        if (user) resolve(user);
        else reject(new Error("Usuario no autenticado"));
      });
    });
    return await user.getIdToken();
  }

  async function fetchAbilities() {
    try {
      const token = await getUserToken();
      const res = await fetch(`https://api-meafpnv6bq-ew.a.run.app/api/getAbilities`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      setAbilities(data.data.abilities);
    } catch (error) {
      console.error('Error al obtener habilidades:', error);
    }
  }

  async function deleteAbility(id) {
    try {
      const token = await getUserToken();
      const res = await fetch(`https://api-meafpnv6bq-ew.a.run.app/api/deleteAbility`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ idAbility: id })
      });
      if (res.ok) {
        setAbilities(abilities.filter(a => a._id !== id));
      }
    } catch (error) {
      console.error('Error al borrar habilidad:', error);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const isEdit = !!editingAbility;

    try {
      const token = await getUserToken();
      const url = isEdit
        ? `https://api-meafpnv6bq-ew.a.run.app/api/updateAbility`
        : `https://api-meafpnv6bq-ew.a.run.app/api/createAbility`;
      const method = isEdit ? 'PUT' : 'POST';

      const payload = isEdit
        ? { idAbility: editingAbility._id, data: formData }
        : formData;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await fetchAbilities();
        setEditingAbility(null);
        setIsCreating(false);
        setFormData({ name: '', description: '' });
      }
    } catch (error) {
      console.error('Error al guardar habilidad:', error);
    }
  }

  const openEdit = (ability) => {
    setEditingAbility(ability);
    setIsCreating(false);
    setFormData({
      name: ability.name,
      description: ability.description || ''
    });
  };

  const openCreate = () => {
    setEditingAbility(null);
    setIsCreating(true);
    setFormData({ name: '', description: '' });
  };

  return (
    <div>
      <h2>Lista de Habilidades</h2>

      <button onClick={openCreate}>
        + Nueva Habilidad
      </button>
      <div className="table-scroll-wrapper">
        <table border="1" cellPadding="8" cellSpacing="0">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {abilities.map((ability) => (
              <tr key={ability._id}>
                <td>{ability.name}</td>
                <td>{ability.description || '-'}</td>
                <td>
                  <button onClick={() => openEdit(ability)}>Editar</button>
                  <button onClick={() => deleteAbility(ability._id)}>Borrar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(editingAbility || isCreating) && (
        <div className="modal-overlay">
          <form onSubmit={handleSubmit}>
            <h3>{editingAbility ? 'Editar Habilidad' : 'Nueva Habilidad'}</h3>

            <label>Nombre:</label>
            <input
              type="text"
              value={formData.name}
              pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$"
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              title="Solo letras y espacios"
            />

            <label>Descripción (opcional):</label>
            <textarea
              value={formData.description}
              pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$"
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              title="Solo letras y espacios"
            />

            <br /><br />
            <button type="submit">Guardar</button>
            <button
              type="button"
              onClick={() => { setEditingAbility(null); setIsCreating(false); }}
            >
              Cancelar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default AbilitiesList;
