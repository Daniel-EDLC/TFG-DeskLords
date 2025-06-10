import { useEffect, useState } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../../firebaseConfig";

function NewsList() {
  const [newsList, setNewsList] = useState([]);
  const [editingNews, setEditingNews] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState(getEmptyForm());

  function getEmptyForm() {
    return {
      title: '',
      content: '',
      image: ''
    };
  }

  useEffect(() => {
    fetchNews();
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

  async function fetchNews() {
    try {
      const token = await getUserToken();
      const res = await fetch(`https://api-meafpnv6bq-ew.a.run.app/api/getNews`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setNewsList(data.data.news);
    } catch (error) {
      console.error('Error al obtener noticias:', error);
    }
  }

  async function deleteNews(id) {
    try {
      const token = await getUserToken();
      const res = await fetch(`https://api-meafpnv6bq-ew.a.run.app/api/deleteNews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ idNews: id })
      });
      if (res.ok) {
        setNewsList(newsList.filter(n => n._id !== id));
      }
    } catch (error) {
      console.error('Error al borrar noticia:', error);
    }
  }

  async function saveNews(e) {
    e.preventDefault();
    const isEdit = !!editingNews;

    const url = isEdit
      ? `https://api-meafpnv6bq-ew.a.run.app/api/updateNews`
      : `https://api-meafpnv6bq-ew.a.run.app/api/createNews`;

    const payload = isEdit
      ? { idNews: editingNews._id, data: formData }
      : formData;

    try {
      const token = await getUserToken();
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await fetchNews();
        setEditingNews(null);
        setIsCreating(false);
        setFormData(getEmptyForm());
      }
    } catch (error) {
      console.error('Error al guardar noticia:', error);
    }
  }

  function openEdit(news) {
    setEditingNews(news);
    setIsCreating(false);
    setFormData({
      title: news.title || '',
      content: news.content || '',
      image: news.image || ''
    });
  }

  return (
    <div>
      <h2>Gestión de Noticias</h2>
      <button onClick={() => { setIsCreating(true); setFormData(getEmptyForm()); setEditingNews(null); }}>
        + Nueva Noticia
      </button>
      <table border="1" cellPadding="8" cellSpacing="0">
        <thead>
          <tr>
            <th>Título</th>
            <th>Contenido</th>
            <th>Imagen</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {newsList.map(news => (
            <tr key={news._id}>
              <td>{news.title}</td>
              <td>{news.content.slice(0, 50)}...</td>
              <td>{news.image || '-'}</td>
              <td>{new Date(news.date).toLocaleDateString()}</td>
              <td>
                <button onClick={() => openEdit(news)}>Editar</button>
                <button onClick={() => deleteNews(news._id)}>Borrar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {(editingNews || isCreating) && (
        <div className="modal-overlay">
          <form onSubmit={saveNews}>
            <h3>{editingNews ? 'Editar Noticia' : 'Nueva Noticia'}</h3>

            <label>Título:</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
            />

            <label>Contenido:</label>
            <textarea
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              required
            />

            <label>URL de Imagen (opcional):</label>
            <input
              type="url"
              value={formData.image}
              onChange={e => setFormData({ ...formData, image: e.target.value })}
            />

            <br /><br />
            <button type="submit">Guardar</button>
            <button type="button" onClick={() => { setEditingNews(null); setIsCreating(false); }}>Cancelar</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default NewsList;
