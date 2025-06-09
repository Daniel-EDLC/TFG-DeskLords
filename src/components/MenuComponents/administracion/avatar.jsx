import { useEffect, useState } from 'react';

function AvatarManager() {
  const [avatars, setAvatars] = useState([]);

  useEffect(() => {
    fetchAvatars();
  }, []);

  async function fetchAvatars() {
    try {
      const res = await fetch(`https://api-meafpnv6bq-ew.a.run.app/api/getAvatars`);
      const data = await res.json();
      setAvatars(data.data.avatars);
    } catch (error) {
      console.error('Error al obtener avatares:', error);
    }
  }

  async function deleteAvatar(id) {
    try {
      const res = await fetch(`https://api-meafpnv6bq-ew.a.run.app/api/deleteAvatar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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

  return (
    <div>
      <h2>Gestión de Avatares</h2>
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
                <button onClick={() => deleteAvatar(avatar._id)}>Borrar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AvatarManager;
