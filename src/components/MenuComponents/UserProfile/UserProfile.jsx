import React from 'react';
import './UserProfile.css';

const UserProfile = ({ avatar, name, level, experience }) => {
  return (
    <div className="user-container">
      <img src={avatar} alt="avatar" className="user-avatar" />
      <h3>{name}</h3>
      <p>Nivel: {level}</p>
      <p>Exp: {experience}</p>
    </div>
  );
};

export default UserProfile;
