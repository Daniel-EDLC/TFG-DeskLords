import React from 'react';
import './PlayerProfile.css';

const PlayerProfile = ({ avatar, name, level, experience }) => {
  return (
    <div className="profile-container">
      <img src={avatar} alt="avatar" className="profile-avatar" />
      <h3>{name}</h3>
      <p>Nivel: {level}</p>
      <p>Experiencia: {experience}</p>
    </div>
  );
};

export default PlayerProfile;
