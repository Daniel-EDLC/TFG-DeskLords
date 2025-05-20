import React from 'react';
import { Avatar, Typography, Box } from '@mui/material';
import './RivalProfile.css';

function RivalProfile({ name, imageUrl, life, mana }) {
  return (
    <Box className="rival-container">
      <Box className="rival-avatar-wrapper">
        <Avatar src={imageUrl} className="rival-avatar" />
        <Box className="rival-life-overlay">
          <Typography className="rival-life-text">
            {life}
          </Typography>
        </Box>
      </Box>
      <Typography className="rival-name">{name}</Typography>
      <Typography className="rival-mana">Mana: {mana}</Typography>
    </Box>
  );
}

export default RivalProfile;
