import { useEffect, useState } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../../firebaseConfig";

function CommentsList() {
  const [comments, setComments] = useState([]);
  const [editingComment, setEditingComment] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState(getEmptyForm());

  function getEmptyForm() {
    return { content: '' };
  }

  useEffect(() => {
    fetchComments();
  }, []);

  async function getUserTokenAndUser() {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        if (user) resolve(user);
        else reject(new Error("Usuario no autenticado"));
      });
    });
  }

  async function fetchComments() {
    try {
      const user = await getUserTokenAndUser();
      const token = await user.getIdToken();
      const res = await fetch(`https://api-meafpnv6bq-ew.a.run.app/api/getComments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setComments(data.data.comments);
    } catch (error) {
      console.error('Error al obtener comentarios:', error);
    }
  }

  async function deleteComment(id) {
    try {
      const user = await getUserTokenAndUser();
      const token = await user.getIdToken();
      const res = await fetch(`https://api-meafpnv6bq-ew.a.run.app/api/deleteComment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ idComment: id })
      });
      if (res.ok) {
        setComments(comments.filter(c => c._id !== id));
      }
    } catch (error) {
      console.error('Error al borrar comentario:', error);
    }
  }

  async function saveComment(e) {
    e.preventDefault();
    const isEdit = !!editingComment;

    try {
      const user = await getUserTokenAndUser();
      const token = await user.getIdToken();

      const url = isEdit
        ? `https://api-meafpnv6bq-ew.a.run.app/api/updateComment`
        : `https://api-meafpnv6bq-ew.a.run.app/api/createComment`;

      const payload = isEdit
        ? { idComment: editingComment._id, data: formData }
        : { playerId: user.uid, content: formData.content };

      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await fetchComments();
        setEditingComment(null);
        setIsCreating(false);
        setFormData(getEmptyForm());
      }
    } catch (error) {
      console.error('Error al guardar comentario:', error);
    }
  }

  function openEdit(comment) {
    setEditingComment(comment);
    setIsCreating(false);
    setFormData({ content: comment.content || '' });
  }

  return (
    <div>
      <h2>Lista de Comentarios</h2>
      <button onClick={() => {
        setIsCreating(true);
        setFormData(getEmptyForm());
        setEditingComment(null);
      }}>
        + Nuevo Comentario
      </button>
      <table border="1" cellPadding="8" cellSpacing="0">
        <thead>
          <tr>
            <th>Autor</th>
            <th>Contenido</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {comments.map(comment => (
            <tr key={comment._id}>
              <td>{comment.author}</td>
              <td>{comment.content}</td>
              <td>{new Date(comment.date).toLocaleDateString()}</td>
              <td>
                <button onClick={() => openEdit(comment)}>Editar</button>
                <button onClick={() => deleteComment(comment._id)}>Borrar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {(editingComment || isCreating) && (
        <div className="modal-overlay">
          <form onSubmit={saveComment}>
            <h3>{editingComment ? 'Editar Comentario' : 'Nuevo Comentario'}</h3>

            <label>Contenido:</label>
            <textarea
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              required
            />

            {editingComment && (
              <>
                <label>Fecha:</label>
                <input
                  type="text"
                  value={new Date(editingComment.date).toLocaleDateString()}
                  readOnly
                />
              </>
            )}

            <br /><br />
            <button type="submit">Guardar</button>
            <button type="button" onClick={() => {
              setEditingComment(null);
              setIsCreating(false);
            }}>
              Cancelar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default CommentsList;
