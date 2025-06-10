import { useEffect, useState } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../../firebaseConfig";

function AvatarManager() {
  const [avatars, setAvatars] = useState([]);
  const [editingAvatar, setEditingAvatar] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState(getEmptyForm());

  function getEmptyForm() {
    return {
      url: '',
      belongsTo: 'store',
      price: '',
      name: ''
    };
  }

  useEffect(() => {
    fetchAvatars();
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

  async function fetchAvatars() {
    try {
      const token = await getUserToken();
      const res = await fetch(`https://api-meafpnv6bq-ew.a.run.app/api/getAvatars`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setAvatars(data.data.avatars);
    } catch (error) {
      console.error('Error al obtener avatares:', error);
    }
  }

  async function deleteAvatar(id) {
    try {
      const token = await getUserToken();
      const res = await fetch(`https://api-meafpnv6bq-ew.a.run.app/api/deleteAvatar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ idAvatar: id })
      });
      if (res.ok) {
        setAvatars(avatars.filter(a => a._id !== id));
      }
    } catch (error) {
      console.error('Error al borrar avatar:', error);
    }
  }

  async function saveAvatar(e) {
    e.preventDefault();
    const isEdit = !!editingAvatar;

    const trimmedUrl = formData.url.trim();

    const baseData = {
      url: trimmedUrl,
      belongsTo: formData.belongsTo,
      name: formData.name?.trim() || 'Avatar sin nombre'
    };

    if (formData.belongsTo === 'store') {
      baseData.price = parseFloat(formData.price) || 0;
    }

    const url = isEdit
      ? `https://api-meafpnv6bq-ew.a.run.app/api/updateAvatar`
      : `https://api-meafpnv6bq-ew.a.run.app/api/createAvatar`;

    const method = isEdit ? 'PUT' : 'POST';

    const payload = isEdit
      ? { idAvatar: editingAvatar._id, data: baseData }
      : baseData;

    try {
      const token = await getUserToken();
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await fetchAvatars();
        setEditingAvatar(null);
        setIsCreating(false);
        setFormData(getEmptyForm());
      }
    } catch (error) {
      console.error('Error al guardar avatar:', error);
    }
  }

  function openEdit(avatar) {
    setEditingAvatar(avatar);
    setIsCreating(false);
    setFormData({
      url: avatar.url || '',
      belongsTo: avatar.belongsTo || 'store',
      price: avatar.price ?? '',
      name: avatar.name ?? ''
    });
  }

  return (
    <div>
      <h2>Gestión de Avatares</h2>
      <button onClick={() => { setIsCreating(true); setFormData(getEmptyForm()); setEditingAvatar(null); }}>
        + Nuevo Avatar
      </button>

      <table border="1" cellPadding="8" cellSpacing="0">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>URL</th>
            <th>Pertenece a</th>
            <th>Precio</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {avatars.map(avatar => (
            <tr key={avatar._id}>
              <td>{avatar.name || '-'}</td>
              <td>{avatar.url}</td>
              <td>{avatar.belongsTo}</td>
              <td>{avatar.price ?? '-'}</td>
              <td>
                <button onClick={() => openEdit(avatar)}>Editar</button>
                <button onClick={() => deleteAvatar(avatar._id)}>Borrar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {(editingAvatar || isCreating) && (
        <div className="modal-overlay">
          <form onSubmit={saveAvatar}>
            <h3>{editingAvatar ? 'Editar Avatar' : 'Nuevo Avatar'}</h3>

            <label>Nombre (opcional):</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />

            <label>URL:</label>
            <input
              type="url"
              value={formData.url}
              onChange={e => setFormData({ ...formData, url: e.target.value })}
              required
            />

            <label>Pertenece a:</label>
            <select
              value={formData.belongsTo}
              onChange={e => setFormData({ ...formData, belongsTo: e.target.value })}
              required
            >
              <option value="store">Store</option>
              <option value="battlepass">Battlepass</option>
              <option value="event">Event</option>
            </select>

            {formData.belongsTo === 'store' && (
              <>
                <label>Precio:</label>
                <input
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || '' })}
                />
              </>
            )}

            <br /><br />
            <button type="submit">Guardar</button>
            <button type="button" onClick={() => { setEditingAvatar(null); setIsCreating(false); }}>Cancelar</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default AvatarManager;
