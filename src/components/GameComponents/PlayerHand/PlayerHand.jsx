import React, { useEffect, useState } from 'react';
import { Paper } from '@mui/material';
import './PlayerHand.css';

function PlayerHand({ cartas, mana, turn, onPlayCard }) {
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [floatingMessage, setFloatingMessage] = useState('');
  const [isFading, setIsFading] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);

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
  const maxRotation = 25;
  const spacing = 110;

  const handleClick = (carta) => {
    if (turn.whose !== 'user' || turn.phase !== 'hand') {
      setFloatingMessage('Solo puedes jugar cartas durante tu fase de mano!');
      return;
    }

    if (selectedCardId === carta.id) {
      // Si es spell o equipamiento, simplemente desselecciona
      if (carta.type === 'equipement' || carta.type === 'spell') {
        setSelectedCardId(null);
        return;
      }

      // Si es criatura, intenta jugarla
      if (carta.cost > mana) {
        setFloatingMessage(`Mana insuficiente! Coste: ${carta.cost}, Tienes: ${mana}`);
        return;
      }
      console.log('Jugando carta:', carta);
      onPlayCard(carta);
      setSelectedCardId(null);
    } else {
      setSelectedCardId(carta.id);

      // Si es spell o equipamiento, lo preparamos para que el usuario seleccione objetivo
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
      <div className="player-hand" style={{ width: `${spacing * total}px` }}>
        {cartas.map((carta, index) => {
          const centerIndex = (total - 1) / 2;
          const offset = index - centerIndex;
          const rotate = (offset / centerIndex) * maxRotation;
          const translateY = -Math.abs(offset) * 12;
          const isHovered = hoveredIndex === index;
          const isSelected = selectedCardId === carta.id;

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
                className={`card ${isHovered ? 'hovered' : ''} ${isSelected ? 'selectedToUse' : ''}`}
                elevation={24}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                data-rotate={`${rotate}deg`}
                style={{ '--rotate': `${rotate}deg` }}
                draggable={turn.whose === 'user' && turn.phase === 'hand'}
                onDragStart={(e) => {
                  if (turn.whose === 'user' && turn.phase === 'hand') {
                     if (carta.cost > mana) {
                          setFloatingMessage(`Mana insuficiente! Coste: ${carta.cost}, Tienes: ${mana}`);
                          return;
                      }     
                    e.dataTransfer.setData('application/json', JSON.stringify({
                      id: carta._id.toString(),
                      type: carta.type,
                      cost: carta.cost,
                    }));
                  } else {
                    setFloatingMessage('No puedes jugar cartas fuera de tu fase de mano!!');
                  }
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
