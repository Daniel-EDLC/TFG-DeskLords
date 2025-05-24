import { Box, Paper } from '@mui/material';
import { useState, useEffect } from 'react';

import './RivalTable.css';

function RivalTable({ cartas, turn, onCardClick }) {
  console.log('el turno es: ', turn)

  const [hiddenCards, setHiddenCards] = useState([]);

  const [removedCards, setRemovedCards] = useState([]);

  useEffect(() => {
    cartas.forEach((carta) => {
      if (carta.alive === false && !hiddenCards.includes(carta.id)) {
        setTimeout(() => {
          setHiddenCards((prev) => [...prev, carta.id]);
        }, 1500); // espera 1.5 segundos antes de ocultarla
      }
    });
  }, [cartas]);


  useEffect(() => {
    cartas.forEach((carta) => {
      if (carta.alive === false && !removedCards.includes(carta.id)) {
        // Aplicar fade primero
        setTimeout(() => {
          setRemovedCards((prev) => [...prev, carta.id]);
        }, 2300); // tiempo total antes de quitarla del DOM
      }
    });
  }, [cartas]);


  
  return (
    <Box className="rival-table-container">
      {cartas.map((carta, index) => {
      if (removedCards.includes(carta.id)) return null;

      const cardClass = ` ${carta.position === 'attack' ? 'attack-position' : ''}`;
      const isFadingOut = hiddenCards.includes(carta.id);

        return (
          <div
                key={carta.id}
                className={`rival-card-wrapper ${isFadingOut ? 'rival-card-fade-out' : ''}`}
              >
            <div className={`rival-card-table`}>
            <Paper
              className={cardClass}
              elevation={10}
              onClick={() => {
                if ((turn.whose === 'rival' && turn.phase === 'attack') && onCardClick) {
                  console.log('Defender a carta:', carta);
                  onCardClick(carta);
                }
              }}
            >
              <img
                src={carta.image}
                alt={`Carta ${index + 1}`}
                className="rival-card-image"
              />

              {carta.equipements && carta.equipements.length > 0 && (
                            <div className="rival-equipment-count">
                              {carta.equipements.length}</div>
                          )}

              {carta.equipements && carta.equipements.length > 0 && (
                <div className="rival-equipment-preview">
                  {carta.equipements.map((equipo) => (
                    <img
                      key={equipo.id}
                      src={equipo.image}
                      alt={equipo.id}
                      className="rival-equipment-image"
                    />
                  ))}
                </div>
              )}
            </Paper>
            </div>
          </div>
        );
      })}
    </Box>
  );
}

export default RivalTable;




