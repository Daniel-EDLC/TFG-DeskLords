import React, { useEffect, useState } from "react";
import { useMediaQuery, Modal, Box } from "@mui/material";
import "./ActualMap.css";

const ActualMap = ({ mapa, onPlay, decks, selectedDeckId, onSelectDeck }) => {
  const isMobile = useMediaQuery("(max-width:435px)");
  const selectedDeck = decks.find(
    (deck) => String(deck._id) === String(selectedDeckId)
  );
  const [openModal, setOpenModal] = useState(false);

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
      <label className="tittle">Selecciona tu deck</label>
      <div className={`mapa-content ${isMobile ? "vertical" : ""}`}>
        {!isMobile && selectedDeck?.image && (
          <img
            src={selectedDeck.image}
            alt={selectedDeck.name}
            className="mapa-imagen"
          />
        )}

        <div className="mapa-info">
          {/* <p>
            {selectedDeck.description ||
              "Descripción del deck próximamente disponible."}
          </p> */}

          <div className="deck-select">
            <div className="deck-selector">
              <div
                className="deck-card selected-deck"
                onClick={() => setOpenModal(true)}
              >
                <p className="deck-name">{selectedDeck?.name}</p>
              </div>
            </div>
          </div>

          <Modal open={openModal} onClose={() => setOpenModal(false)}>
            <Box className="deck-modal-box">
              <h3>Selecciona tu mazo</h3>
              <div className="deck-options">
                {decks
                  .filter((deck) => deck.available)
                  .map((deck) => (
                    <div
                      key={deck._id}
                      className="deck-card"
                      onClick={() => {
                        onSelectDeck(deck._id);
                        setOpenModal(false);
                      }}
                    >
                      <p className="deck-name">{deck.name}</p>
                    </div>
                  ))}
              </div>
            </Box>
          </Modal>

          <button disabled={!selectedDeckId} onClick={onPlay}>
            Comenzar batalla
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActualMap;
