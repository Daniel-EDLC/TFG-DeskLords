import React from 'react';
import { useEffect } from 'react';

import './ActualMap.css';

const ActualMap = ({ mapa, onPlay, decks, selectedDeckId, onSelectDeck }) => {
  

  const isMobile = window.innerWidth <= 435;
  const selectedDeck = decks.find(deck => deck._id === selectedDeckId);

    useEffect(() => {
    if (!selectedDeckId && decks.length > 0) {
      onSelectDeck(decks[0]._id);
    }
  }, [decks, selectedDeckId, onSelectDeck]);

if (!mapa) return null;
  return (
    <div
  className={`mapa-actual ${isMobile ? 'mapa-fondo' : ''}`}
  style={
  isMobile && selectedDeck?.portada
    ? { backgroundImage: `url(${selectedDeck.portada})` }
    : {}
}
>
      <label className='tittle'>Enfréntate al deck de {mapa.nombre}</label>
      <div className={`mapa-content ${isMobile ? 'vertical' : ''}`}>
        {!isMobile && selectedDeck && (
          <img
            src={selectedDeck.portada || "https://via.placeholder.com/300x150"}
            alt={selectedDeck.nombre}
            className="mapa-imagen"
          />
        )}

        <div className="mapa-info">
          <p>{mapa.descripcion || "Descripción del mapa próximamente disponible."}</p>

          <div className="deck-select">
            <select
              id="deck"
              value={selectedDeckId}
              onChange={(e) => onSelectDeck(e.target.value)}
            >
              {decks
                .filter((deck) => deck.available)
                .map((deck) => (
                  <option key={deck._id} value={deck._id}>
                    {deck.nombre}
                  </option>
              ))}
            </select>
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
