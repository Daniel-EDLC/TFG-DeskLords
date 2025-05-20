import React from 'react';
import { Box, Paper } from '@mui/material';
import './RivalHand.css'; // Importa el archivo CSS

function RivalHand({ cantidad }) {
  const total = cantidad;
  const maxRotation = 25;
  const spacing = 110;

  const cartas = Array.from({ length: total }, () => '/cards/cardBack.jpg');

  return (
    <Box className="rival-hand-container" sx={{ width: `${spacing * total}px` }}>
      {cartas.map((url, index) => {
        const centerIndex = (total - 1) / 2;
        const offset = index - centerIndex;
        const rotate = -(offset / centerIndex) * maxRotation;
        const translateY = -Math.abs(offset) * 12;

        return (
          <Paper
            key={index}
            elevation={24}
            className="rival-card"
            sx={{
              left: `calc(50% + ${offset * spacing}px)`,
              top: `${translateY}px`,
              transform: `translateX(-50%) rotate(${rotate}deg)`,
            }}
          >
            <img
              src={url}
              alt={`Carta ${index + 1}`}
            />
          </Paper>
        );
      })}
    </Box>
  );
}

export default RivalHand;
