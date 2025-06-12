
import React, { useState } from "react";
import { AddComment } from "../../../services/Actions/MenuActions";
import "./AddCommentForm.css";

function AddCommentForm({ onClose }) {
  const [mensaje, setMensaje] = useState("");

  const handleEnviar = async () => {
    if (!mensaje.trim()) return;
    await AddComment(mensaje);
    setMensaje("");
    onClose();
  };

  return (
    <div className="comentario-form">
      <h4>Añadir comentario</h4>
      <textarea
        className="see-social-textarea"
        rows={5}
        placeholder="Escribe tu comentario o sugerencia"
        value={mensaje}
        onChange={(e) => setMensaje(e.target.value)}
      />
      <button className="see-social-button" onClick={handleEnviar}>
        Enviar
      </button>
    </div>
  );
}

export default AddCommentForm;
