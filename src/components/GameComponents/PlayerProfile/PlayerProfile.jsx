import React from "react";
import { Avatar, Typography, Box } from "@mui/material";
import "./PlayerProfile.css";

function PlayerProfile({ name, imageUrl, life, mana, deck }) {
  return (
    <Box className="profile-container">
      <Box className="profile-with-deck">
        <Box className="deck-preview">
          <img
            src="public/cards/cardBack.jpg"
            alt="Mazo"
            className="deck-card-image"
          />
          <Box className="deck-count">{deck}</Box>
        </Box>
        <Box className="profile-card">
          <Box className="avatar-wrapper">
            <Avatar src={imageUrl} className="avatar-image" />
            <Box className="life-overlay">
              <Typography className="life-text">{life}</Typography>
            </Box>
          </Box>
          <Typography className="profile-name">{name}</Typography>
          <Box className="mana-wrapper">
            <img
              src="public\manaFinal2.gif"
              alt="Mana"
              className="mana-image"
            />
            <Box className="mana-count">{mana}</Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default PlayerProfile;
