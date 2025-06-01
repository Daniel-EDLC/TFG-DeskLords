import React, { useState } from "react";
import LockIcon from "@mui/icons-material/Lock";
import { Modal, Box } from "@mui/material";


import "./Decks.css";

function Decks({ decks }) {
  const [filtro, setFiltro] = useState("");
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  const [ordenAscendente, setOrdenAscendente] = useState(true);
  const [deckSeleccionado, setDeckSeleccionado] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);



  const decksFiltrados = decks
    .filter((deck) => deck.name.toLowerCase().includes(filtro.toLowerCase()))
    .filter((deck) => (soloDisponibles ? deck.available : true))
    .sort((a, b) => {
      if (a.name < b.name) return ordenAscendente ? -1 : 1;
      if (a.name > b.name) return ordenAscendente ? 1 : -1;
      return 0;
    });

  return (
    <div className="deck-container">
      <div className="deck-controls">
        <button
          className="deck-sort-button"
          onClick={() => setOrdenAscendente(!ordenAscendente)}
        >
          Nombre{ordenAscendente ? "▲" : "▼"}
        </button>
        <input
          type="text"
          placeholder="Buscar mazo..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="deck-filter-input"
        />

        <label className="deck-checkbox">
         <label className="deck-toggle">
            <input
              type="checkbox"
              checked={soloDisponibles}
              onChange={() => setSoloDisponibles(!soloDisponibles)}
            />
            <span className="slider" />
            <span className="toggle-label">Disp.</span>
          </label>
        </label>
      </div>

      <div className="deck-gallery">
        {decksFiltrados.map((deck) => (
          <div
            key={deck._id}
            className={`deck-card ${deck.available ? "" : "disabled"}`}
           onClick={() => {
              if (deck.available) {
                setDeckSeleccionado(deck);
                setModalAbierto(true);
              }
            }}

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
         <Modal open={modalAbierto} onClose={() => setModalAbierto(false)}>
          <Box className="deck-modal-box">
            <h3>{deckSeleccionado?.name}</h3>
            <div className="deck-cards">
              {deckSeleccionado?.cards?.map((card) => (
                <div key={card._id} className="card-preview">
                  <img src={card.front_image} alt={card.name} />
                  <p>{card.name}</p>
                </div>
              ))}
            </div>
          </Box>
        </Modal>
    </div>
 

    
    
  );
}

export default Decks;
