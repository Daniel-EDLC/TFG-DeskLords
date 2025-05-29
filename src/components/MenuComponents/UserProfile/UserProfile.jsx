import React from 'react';
import './UserProfile.css';

const UserProfile = ({ avatar, name, level, experience, email, rol }) => {
  return (
    <div className="user-container">
      <img src={avatar} alt="avatar" className="user-avatar" />
      <h1 className="user-nick">{name}</h1>
      <h2 className="user-name">{name}</h2>
      <div className="user-info">
        <p><strong>Nivel:</strong> {level}</p>
        <p><strong>Experiencia:</strong> {experience}</p>
        <p><strong>Email:</strong> {email}</p>
        <p><strong>Rol:</strong> {rol}</p>
      </div>
    </div>
  );
};

export default UserProfile;

