import React from 'react';
import './UserProfile.css';

const UserProfile = ({
  avatar,
  name,
  level,
  experience,
  email,
  rol,
  partidasGanadas,
  partidasPerdidas,
  mazoFavorito
}) => {
  const experienciaPorNivel = 100;
  const progreso = Math.min((experience % experienciaPorNivel) / experienciaPorNivel * 100, 100);
  const totalPartidas = partidasGanadas + partidasPerdidas;
  const victoryPercent = totalPartidas > 0 ? Math.round((partidasGanadas / totalPartidas) * 100) : 0;

  return (
    <div className="profile-wrapper">
      {/* Caja 1: Información personal */}
      <div className="profile-box">
        <div className="profile-header">
          <img src={avatar} alt="avatar" className="profile-avatar" />
          <div className="profile-info">
            <h2 className="profile-name">{name}</h2>
            <p className="profile-role">Rol: {rol}</p>
            <p className="profile-email">{email}</p>
          </div>
        </div>
        <div className="profile-favorite-deck">
          <h3>Mazo más usado</h3>
          <p>{mazoFavorito}</p>
        </div>
      </div>

      {/* Caja 2: Stats */}
      <div className="profile-box">
        <div className="profile-level">
          <p>Nivel {level}</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progreso}%` }}></div>
          </div>
          <span>{experience % experienciaPorNivel} / {experienciaPorNivel} XP</span>
        </div>

        <div className="profile-stats-circular">
          <div className="circular-chart" style={{
            background: `conic-gradient(#c0b303 ${victoryPercent}%, rgba(255,255,255,0.1) 0)`
          }}>
            <span>{victoryPercent}%</span>
          </div>
          <div className="circular-legend">
            <p>Ganadas: {partidasGanadas}</p>
            <p>Perdidas: {partidasPerdidas}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
