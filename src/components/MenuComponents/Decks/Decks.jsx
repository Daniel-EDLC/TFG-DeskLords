import React from "react";
import LockIcon from "@mui/icons-material/Lock";
import "./Decks.css";

function Decks({ decks }) {
  return (
    <div className="deck-gallery">
      {decks.map((deck) => (
        <div
          key={deck.id}
          className={`deck-card ${deck.available ? '' : 'disabled'}`}
          onClick={() => deck.available && console.log(`Seleccionaste ${deck.nombre}`)}
        >
          <img src={deck.portada} alt={deck.nombre} className="deck-image" />
          {!deck.available && (
            <div className="deck-lock-overlay">
              <LockIcon className="lock-icon" />
            </div>
          )}
          <p className="deck-name">{deck.nombre}</p>
        </div>
      ))}
    </div>
  );
}

export default Decks;
