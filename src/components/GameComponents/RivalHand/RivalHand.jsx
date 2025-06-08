import React from 'react';
import { Box, Paper } from '@mui/material';
import './RivalHand.css';

function RivalHand({ cantidad }) {
  const total = cantidad;
  const cartas = Array.from({ length: total }, () => 'https://storage.googleapis.com/imagenes-desklords/Imagenes_Cartas/Traseras/back_card.png');

  return (
    <Box className="rival-hand-container">
      {cartas.map((url, index) => {
        const centerIndex = (total - 1) / 2;
        const offset = Math.round(index - centerIndex);
        const offsetClass = `rival-offset-${offset}`;

        return (
          <Paper
            key={index}
            elevation={24}
            className={`rival-card ${offsetClass}`}
          >
            <img
              src={url}
              alt={`Carta ${index + 1}`}
              className="rival-card-image"
            />
          </Paper>
        );
      })}
    </Box>
  );
}

export default RivalHand;
