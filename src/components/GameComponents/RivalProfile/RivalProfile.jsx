import React from "react";
import { Avatar, Typography, Box } from "@mui/material";
import "./RivalProfile.css";

function RivalProfile({ name, imageUrl, life, mana, deck }) {
  return (
    <Box className="rival-container">
      <Box className="rival-with-deck">
       

        <Box className="rival-profile-card">
          <Box className="rival-avatar-wrapper">
            <Avatar src={imageUrl} className="rival-avatar-image" />
            <Box className="rival-life-overlay">
              <Typography className="rival-life-text">{life}</Typography>
            </Box>
          </Box>
          <Typography className="rival-profile-name">{name}</Typography>
          <Box className="rival-mana-wrapper">
            <img
              src="/manaFinal2.gif"
              alt="Mana"
              className="rival-mana-image"
            />
            <Box className="rival-mana-count">{mana}</Box>
          </Box>
        </Box>
         <Box className="rival-deck-preview">
          <img
            src="https://storage.googleapis.com/imagenes-desklords/Imagenes_Cartas/Traseras/back_card.jpg"
            alt="Mazo"
            className="rival-deck-card-image"
          />
          <Box className="rival-deck-count">{deck}</Box>
        </Box>
      </Box>
    </Box>
  );
}

export default RivalProfile;
