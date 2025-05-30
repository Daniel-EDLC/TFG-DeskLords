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
  isMobile && selectedDeck?.image
    ? { backgroundImage: `url(${selectedDeck.image})` }
    : {}
}
>
      <label className='tittle'>Enfréntate al deck de {mapa.name}</label>
      <div className={`mapa-content ${isMobile ? 'vertical' : ''}`}>
        {!isMobile && selectedDeck && (
          <img
            src={selectedDeck.image}
            alt={selectedDeck.name}
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
                    {deck.name}
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
