import React from "react";
import { useEffect, useState } from "react";
import { useMediaQuery } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import "./ActualMap.css";

const ActualMap = ({ mapa, onPlay, decks, selectedDeckId, onSelectDeck }) => {
  const isMobile = useMediaQuery("(max-width:435px)");
  const selectedDeck = decks.find(
    (deck) => String(deck._id) === String(selectedDeckId)
  );
  const [showDeckOptions, setShowDeckOptions] = useState(false);

  useEffect(() => {
    if (!selectedDeckId && decks.length > 0) {
      onSelectDeck(decks[0]._id);
    }
  }, [decks, selectedDeckId, onSelectDeck]);

  if (!mapa) return null;
  return (
    <div
      key={selectedDeckId}
      className={`mapa-actual ${isMobile ? "mapa-fondo" : ""}`}
      style={
        isMobile && selectedDeck?.image
          ? { backgroundImage: `url(${selectedDeck.image})` }
          : {}
      }
    >
      <label className="tittle">Enfréntate al deck de {mapa.name}</label>
      <div className={`mapa-content ${isMobile ? "vertical" : ""}`}>
        {!isMobile && selectedDeck && (
          <img
            src={selectedDeck.image}
            alt={selectedDeck.name}
            className="mapa-imagen"
          />
        )}

        <div className="mapa-info">
          <p>
            {mapa.descripcion ||
              "Descripción del mapa próximamente disponible."}
          </p>

          <div className="deck-select">
            <div className="deck-selector">
              <div
                className="deck-card selected-deck"
                onClick={() => setShowDeckOptions(!showDeckOptions)}
              >
                <p className="deck-name">{selectedDeck.name}</p>
              </div>

              {showDeckOptions && (
                <div className="deck-options">
                  {decks
                    .filter((deck) => deck.available)
                    .map((deck) => (
                      <div
                        key={deck._id}
                        className={`deck-card ${
                          deck.available ? "" : "disabled"
                        }`}
                        onClick={() => {
                          if (!deck.available) return;
                          onSelectDeck(deck._id);
                          setShowDeckOptions(false);
                        }}
                      >
                        {!deck.available && (
                          <div className="deck-lock-overlay">
                            <LockIcon className="lock-icon" />
                          </div>
                        )}
                        <p className="deck-name">{deck.name}</p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
          <button disabled={!selectedDeckId} onClick={onPlay}>
            Comenzar batalla
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActualMap;
