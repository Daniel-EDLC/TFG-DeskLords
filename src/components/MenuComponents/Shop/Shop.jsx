import React, { useState } from "react";
import "./Shop.css";

function Shop({ decks }) {
  const mazosTienda = decks.filter((deck) => deck.available === false);
  const [indice, setIndice] = useState(0);

  if (mazosTienda.length === 0) {
    return <p className="tienda-empty">No hay mazos en la tienda actualmente.</p>;
  }

  const siguiente = () => {
    setIndice((prev) => (prev === mazosTienda.length - 1 ? 0 : prev + 1));
  };

  const anterior = () => {
    setIndice((prev) => (prev === 0 ? mazosTienda.length - 1 : prev - 1));
  };

  const mazo = mazosTienda[indice];

  return (
    <div className="tienda-container">
      
      <div className="tienda-carrusel">
        <button className="flecha" onClick={anterior}>&#8249;</button>

        <div className="mazo-card">
          <h2>Tienda</h2>
          <img src={mazo.image} alt={mazo.name} className="mazo-imagen" />
          <h3>Desbloquea {mazo.name}</h3>
          <p>{mazo.description}</p>
        </div>

        <button className="flecha" onClick={siguiente}>&#8250;</button>
      </div>
    </div>
  );
}

export default Shop;
