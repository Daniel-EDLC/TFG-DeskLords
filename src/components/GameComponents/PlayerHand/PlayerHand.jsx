import React, { useEffect, useState } from 'react';
import { Paper } from '@mui/material';
import './PlayerHand.css';

function PlayerHand({ cartas, mana, turn, onPlayCard }) {
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [floatingMessage, setFloatingMessage] = useState('');
  const [isFading, setIsFading] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [longPressCardId, setLongPressCardId] = useState(null);
  const [longPressTimeout, setLongPressTimeout] = useState(null);
  

  

  useEffect(() => {
    if (turn.phase !== 'hand') {
      setSelectedCardId(null);
    }
  }, [turn.phase]);

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

  const handleClick = (carta) => {
    if (turn.whose !== 'user' || turn.phase !== 'hand') {
      setFloatingMessage('Solo puedes jugar cartas durante tu fase de mano!');
      return;
    }

    if (selectedCardId === carta.id) {
      if (carta.type === 'equipement' || carta.type === 'spell') {
        setSelectedCardId(null);
        return;
      }

      if (carta.cost > mana) {
        setFloatingMessage(`Mana insuficiente! Coste: ${carta.cost}, Tienes: ${mana}`);
        return;
      }

      onPlayCard(carta);
      setSelectedCardId(null);
    } else {
      setSelectedCardId(carta.id);

      if (carta.cost > mana) {
        setFloatingMessage(`Mana insuficiente! Coste: ${carta.cost}, Tienes: ${mana}`);
        return;
      }

      if (carta.type === 'equipement' || carta.type === 'spell') {
        onPlayCard(carta);
      }
    }
  };

  return (
    <>
      <div className="player-hand">
        {cartas.map((carta, index) => {
          const centerIndex = (total - 1) / 2;
          const offset = Math.round(index - centerIndex);
          const offsetClass = `player-offset-${offset}`;

          const isHovered = hoveredIndex === index;
          const isSelected = selectedCardId === carta.id;

          return (
            <div
              key={carta.id}
            className={`card-container ${offsetClass} ${longPressCardId === carta.id ? 'long-pressed-container' : ''}`}
            >
              <Paper
                className={`card ${isHovered ? 'hovered' : ''} ${isSelected ? 'selectedToUse' : ''} ${longPressCardId === carta.id ? 'long-pressed' : ''}`}
                elevation={24}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                draggable={turn.whose === 'user' && turn.phase === 'hand'}
                onDragStart={(e) => {
                  if (turn.whose === 'user' && turn.phase === 'hand') {
                    if (carta.cost > mana) {
                      setFloatingMessage(`Mana insuficiente! Coste: ${carta.cost}, Tienes: ${mana}`);
                      return;
                    }
                    e.dataTransfer.setData('application/json', JSON.stringify({
                      id: carta.id,
                      type: carta.type,
                      cost: carta.cost,
                    }));
                  } else {
                    setFloatingMessage('No puedes jugar cartas fuera de tu fase de mano!!');
                  }
                }}
                onTouchStart={() => {
                  const timeoutId = setTimeout(() => {
                    setLongPressCardId(carta.id);
                  }, 500);
                  setLongPressTimeout(timeoutId);
                }}
                onTouchEnd={() => {
                  clearTimeout(longPressTimeout);
                  setLongPressCardId(null);
                }}
                onTouchCancel={() => {
                  clearTimeout(longPressTimeout);
                  setLongPressCardId(null);
                }}
                onClick={() => handleClick(carta)}
              >
                <img
                  src={carta.front_image}
                  alt={`Carta ${index + 1}`}
                  className="card-image"
                />
              </Paper>
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
