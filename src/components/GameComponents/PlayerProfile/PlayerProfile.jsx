import React from 'react';
import { Avatar, Typography, Box, Button } from '@mui/material';
import './PlayerProfile.css';

function PlayerProfile({ name, imageUrl, life, mana}) {
  return (
    <>
      

      <Box className="profile-container">
        <Box className="profile-card">
          <Box className="avatar-wrapper">
            <Avatar src={imageUrl} className="avatar-image" />
            <Box className="life-overlay">
              <Typography className="life-text">{life}</Typography>
            </Box>
          </Box>
          <Typography className="player-name">{name}</Typography>
          <Typography className="mana-text">Mana: {mana}</Typography>
        </Box>
      </Box>
    </>
  );
}



export default PlayerProfile;
