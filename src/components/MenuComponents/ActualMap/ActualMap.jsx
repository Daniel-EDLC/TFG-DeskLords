// ActualMap.jsx
import React from 'react';
import './ActualMap.css';

const ActualMap = ({ mapa, onPlay, decks, selectedDeckId, onSelectDeck }) => {
  if (!mapa) return null;

  return (
    <div className="mapa-actual">
        <label className='tittle'> Enfrentarte al deck de {mapa.nombre}</label>
        <div className='mapa-content'>
      <img src={mapa.imagen || "https://via.placeholder.com/300x150"} alt={mapa.nombre} className="mapa-imagen" />
      <div className="mapa-info">
        
        <p>{mapa.descripcion || "Descripción del mapa próximamente disponible."}</p>

        <div className="deck-select">
          <select id="deck" value={selectedDeckId} onChange={(e) => onSelectDeck(e.target.value)}>
            <option value="">Prepara tu batalla</option>
            {decks.map(deck => (
              <option key={deck.id} value={deck.id}>
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
