import React, { useState } from "react";
import { Avatar, Typography, Box, Dialog, DialogTitle, DialogActions, Button } from "@mui/material";
import "./PlayerProfile.css";

function PlayerProfile({ name, imageUrl, life, mana, deck, onSurrender }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleClick = () => {
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    if (onSurrender) onSurrender(); 
  };

  const handleCancel = () => {
    setConfirmOpen(false);
  };

  return (
    <>
      <Box className="profile-container">
        <Box className="profile-with-deck">
          <Box className="deck-preview">
            <img
              src="https://storage.googleapis.com/imagenes-desklords/Imagenes_Cartas/Traseras/back_card.png"
              alt="Mazo"
              className="deck-card-image"
            />
            <Box className="deck-count">{deck}</Box>
          </Box>
          <Box className="profile-card">
            <Box
              className="avatar-wrapper clickable"
              onClick={handleClick}
            >
              <Avatar src={imageUrl} className="avatar-image" />
              <Box className="life-overlay">
                <Typography className="life-text">{life}</Typography>
              </Box>
            </Box>
            <Typography className="profile-name">{name}</Typography>
            <Box className="mana-wrapper">
              <img
                src="public/manaFinal2.gif"
                alt="Mana"
                className="mana-image"
              />
              <Box className="mana-count">{mana}</Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Modal de confirmación */}
      <Dialog open={confirmOpen} onClose={handleCancel}>
        <DialogTitle>¿Estás seguro de que quieres rendirte?</DialogTitle>
        <DialogActions>
          <Button onClick={handleCancel}>Cancelar</Button>
          <Button onClick={handleConfirm} variant="contained" color="error">
            Rendirse
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default PlayerProfile;
