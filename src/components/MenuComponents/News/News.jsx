import React, { useState, useEffect } from "react";
import "./News.css";

function News({ noticias }) {
  const [indiceActual, setIndiceActual] = useState(0);

  useEffect(() => {
    if (!noticias || noticias.length <= 1) return;

    const intervalo = setInterval(() => {
      setIndiceActual((prev) => (prev === noticias.length - 1 ? 0 : prev + 1));
    }, 7000);

    return () => clearInterval(intervalo);
  }, [noticias.length]);

  const anterior = () => {
    setIndiceActual((prev) => (prev === 0 ? noticias.length - 1 : prev - 1));
  };

  const siguiente = () => {
    setIndiceActual((prev) => (prev === noticias.length - 1 ? 0 : prev + 1));
  };

  if (!noticias || noticias.length === 0) return null;

  const noticia = noticias[indiceActual];

  return (
    <div className="noticias-carrusel">
      <div className="noticia-slide">
        <button className="flecha" onClick={anterior}>
          &#8249;
        </button>

        <div className="noticia-card">
            <img
              src={"/LOGO.png"}
              alt={noticia.title}
              className="noticia-img"
            />
          <div className="noticia-texto">
            <h3>{noticia.title}</h3>
            <p>{noticia.content}</p>
            <span className="noticia-fecha">
              {new Date(noticia.date).toLocaleDateString()}
            </span>
          </div>
        </div>

        <button className="flecha" onClick={siguiente}>
          &#8250;
        </button>
      </div>
    </div>
  );
}

export default News;
