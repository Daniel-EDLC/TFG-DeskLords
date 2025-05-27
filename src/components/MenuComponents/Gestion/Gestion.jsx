import React from 'react';
import './Gestion.css';
import { Box, Typography, Button } from '@mui/material';

function Gestion() {
  return (
    <Box className="gestion-container">
      <Typography variant="h6" className="gestion-title">
       Panel de adminsitrador
      </Typography>
      <Box className="gestion-buttons">
        <Button className="gestion-btn avatar-btn" variant="contained">
          aCCEDER bbdd
        </Button>
        <Button className="gestion-btn logout-btn" variant="contained">
          CERRAR SESIÓN
        </Button>
      </Box>
    </Box>
  );
}

export default Gestion;
