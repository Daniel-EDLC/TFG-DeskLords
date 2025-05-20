import React, { useEffect, useState } from 'react';
import { Paper, Button } from '@mui/material';
import './PlayerHand.css';

function PlayerHand({ cartas, mana, phase, onPlayCard, selectedTableCardId  }) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [floatingMessage, setFloatingMessage] = useState('');
  const [isFading, setIsFading] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    if (phase !== 'hand') {
      setSelectedIndex(null);
    }
  }, [phase]);

  useEffect(() => {
    if (floatingMessage) {
      setIsFading(false);
      const fadeTimer = setTimeout(() => setIsFading(true), 2500);
      const removeTimer = setTimeout(() => setFloatingMessage(''), 3000);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [floatingMessage]);

  const total = cartas.length;
  const maxRotation = 25;
  const spacing = 110;

  return (
    <>
      <div className="player-hand" style={{ width: `${spacing * total}px` }}>
        {cartas.map((carta, index) => {
          const centerIndex = (total - 1) / 2;
          const offset = index - centerIndex;
          const rotate = (offset / centerIndex) * maxRotation;
          const translateY = -Math.abs(offset) * 12;
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={carta.id}
              className="card-container"
              style={{
                left: `calc(50% + ${offset * spacing}px)`,
                bottom: `${translateY}px`,
              }}
            >
              <Paper
                className={`card ${isHovered ? 'hovered' : ''}`}
                elevation={24}
                onClick={() => setSelectedIndex(index)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                data-rotate={`${rotate}deg`}
                style={{
                  '--rotate': `${rotate}deg`,
                }}
              >
                <img
                  src={carta.image}
                  alt={`Carta ${index + 1}`}
                  className="card-image"
                />
              </Paper>

              {selectedIndex === index && phase === 'hand' && (
                  <Button
                    className="play-button"
                    variant="contained"
                    onClick={() => {
                      if (carta.cost > mana) {
                        setFloatingMessage(`Mana insuficiente! Coste: ${carta.cost}, Tienes: ${mana}`);
                        return;
                      }

                      const cardToSend = {
                        id: carta.id,
                        type: carta.type,
                        ...((carta.type === 'equipement' || carta.type === 'spell') && selectedTableCardId
                          ? { targetId: selectedTableCardId }
                          : {}),
                      };

                      onPlayCard(cardToSend);
                    }}
                  >
                    Jugar
                  </Button>
                )}
            </div>
          );
        })}
      </div>

      {floatingMessage && ( 
        <div className={`floating-overlay ${isFading ? 'fade-out' : ''}`}>
          <div className="floating-message">{floatingMessage}</div>
        </div>
      )}
    </>
  );
}

export default PlayerHand;
