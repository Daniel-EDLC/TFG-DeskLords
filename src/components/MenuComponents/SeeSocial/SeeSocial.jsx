import React, { useState, useEffect, useRef } from "react";
import "./SeeSocial.css";
import { getComments, AddComment } from "../../../services/Actions/MenuActions";
import useMediaQuery from "@mui/material/useMediaQuery";

function ComentarioForm({ onNewComment }) {
  const [mensaje, setMensaje] = useState("");

  const handleEnviar = async () => {
    if (mensaje.trim().length === 0) return;
    const nuevoComentario = await AddComment(mensaje);
    setMensaje("");
    if (nuevoComentario) onNewComment(nuevoComentario);
  };

  return (
    <div className="comentario-form">
      <textarea
        rows={5}
        placeholder="Escribe tu comentario"
        value={mensaje}
        onChange={(e) => setMensaje(e.target.value)}
        className="comentario-textarea"
      />
      <button className="comentario-button" onClick={handleEnviar}>
        Enviar
      </button>
    </div>
  );
}

function SeeSocial() {
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const lastCommentRef = useRef(null);
  const [searchAuthor, setSearchAuthor] = useState("");
  const isMobile = useMediaQuery("(max-width:435px)");
  const [modalOpen, setModalOpen] = useState(false);

  const loadMore = async () => {
    try {
      const res = await getComments(page, searchAuthor);

      console.log("respuesta ", res);
      const comentarios = res.comments || [];
      const hayMas = res.hasMore ?? false;

      if (comentarios.length === 0 || !hayMas) {
        setHasMore(false);
        return;
      }

      setComments((prev) => [...prev, ...comentarios]);
      setPage((prev) => prev + 1);
      setHasMore(hayMas);
    } catch (err) {
      console.error("❌ Error al cargar comentarios:", err);
    }
  };

  useEffect(() => {
    loadMore();
    console.log("comentarios a mostrar", comments);
  }, []);

  useEffect(() => {
    if (!hasMore || !lastCommentRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(lastCommentRef.current);
    return () => {
      if (lastCommentRef.current) observer.unobserve(lastCommentRef.current);
    };
  }, [comments, hasMore]);

  const handleNewComment = (nuevoComentario) => {
    setComments((prev) => [nuevoComentario, ...prev]);
  };

  useEffect(() => {
  setComments([]);
  setPage(0);
  setHasMore(true);
  loadMore();
}, [searchAuthor]);


  return (
    <div className="see-social-container">

      <input
        type="text"
        placeholder="Buscar por autor..."
        className="comentario-busqueda"
        value={searchAuthor}
onChange={(e) => setSearchAuthor(e.target.value)}

      />


      {isMobile ? (
        <>
          <button
            className="floating-button"
            onClick={() => setModalOpen(true)}
          >
            +
          </button>

{modalOpen && (
  <div className="comentario-modal" onClick={() => setModalOpen(false)}>
    <div
      className="comentario-modal-content"
      onClick={(e) => e.stopPropagation()}
    >
      <ComentarioForm
        onNewComment={(comentario) => {
          handleNewComment(comentario);
          setModalOpen(false);
        }}
      />
    </div>
  </div>
)}

        </>
      ) : (
        <ComentarioForm onNewComment={handleNewComment} />
      )}



      <div className="comentarios-scroll">
        {comments.map((comment, index) => (
          <div
            key={comment._id || index}
            className="comentario-item"
            ref={index === comments.length - 1 ? lastCommentRef : null}
          >
            <div className="comentario-header">
              <img
                src={comment.playerAvatar || "/fallback-avatar.png"}
                alt="avatar"
                className="comentario-avatar"
              />
              <div>
                <p className="comentario-autor">
                  {comment.author || "Anónimo"}
                </p>
                <span className="comentario-fecha">
                  {comment.createdAt
                    ? new Date(comment.createdAt).toLocaleString()
                    : "Fecha no disponible"}
                </span>
              </div>
            </div>

            <div className="comentario-contenido">
              <p className="comentario-texto">{comment.content}</p>
            </div>
          </div>
        ))}
        {!hasMore && <p className="fin-comentarios">No hay más comentarios</p>}
      </div>
    </div>
  );
}

export default SeeSocial;
