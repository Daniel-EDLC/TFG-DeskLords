import React from "react";
import LockIcon from "@mui/icons-material/Lock";
import "./Decks.css";

function Decks({ decks }) {
  return (
    <div className="deck-gallery">
      {decks.map((deck) => (
        <div
          key={deck._id}
          className={`deck-card ${deck.available ? '' : 'disabled'}`}
          onClick={() => deck.available && console.log(`Seleccionaste ${deck.name}`)}
        >
          <img src={deck.image} alt={deck.name} className="deck-image" />
          {!deck.available && (
            <div className="deck-lock-overlay">
              <LockIcon className="lock-icon" />
            </div>
          )}
          <p className="deck-name">{deck.name}</p>
        </div>
      ))}
    </div>
  );
}

export default Decks;
