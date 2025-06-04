import React, { useState } from "react";
import "./ContactUs.css";

function ContactUs() {
  const [mensaje, setMensaje] = useState("");

  const handleEnviar = () => {
    alert("Gracias por tu mensaje. Lo tendremos en cuenta.");
    setMensaje("");
  };

  return (
    <div className="contacto-container">
      <h4>Contacto</h4>
      <p>¿Tienes alguna duda, sugerencia o mejora? ¡Escríbenos!</p>

      <div className="contacto-info">
        <p><strong>Email:</strong> soporte@desklords.com</p>
        <p><strong>Teléfono:</strong> +34 600 123 456</p>
      </div>

      <textarea
        className="contacto-textarea"
        rows={5}
        placeholder="Escribe tu comentario o sugerencia"
        value={mensaje}
        onChange={(e) => setMensaje(e.target.value)}
      />

      <button className="contacto-button" onClick={handleEnviar}>
        Enviar
      </button>
    </div>
  );
}

export default ContactUs;
