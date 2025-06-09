import React, { useState } from 'react';
import './UserProfile.css';
import { setAvatarPrincipal } from '../../../services/Actions/MenuActions';

const UserProfile = ({
  avatar,
  avatars = [],
  name,
  level,
  experience,
  email,
  rol,
  partidasGanadas,
  partidasPerdidas,
  mazoFavorito,
  userId, // asegúrate de pasar esto desde el componente padre
  onAvatarChange, // opcional, para recargar avatar tras cambio
}) => {
  const [modalAbierto, setModalAbierto] = useState(false);

  const experienciaPorNivel = 100;
  const progreso = Math.min((experience % experienciaPorNivel) / experienciaPorNivel * 100, 100);
  const totalPartidas = partidasGanadas + partidasPerdidas;
  const victoryPercent = totalPartidas > 0 ? Math.round((partidasGanadas / totalPartidas) * 100) : 0;

  const avatarsDisponibles = avatars.filter(a => a.available);

  const handleSeleccionarAvatar = async (avatarId) => {
    try {
      await setAvatarPrincipal(userId, avatarId);
      alert("Avatar cambiado correctamente");
      setModalAbierto(false);
      if (onAvatarChange) onAvatarChange(); // recargar datos si lo deseas
    } catch (error) {
      alert("Error al cambiar el avatar");
    }
  };

  return (
    <div className="profile-wrapper">
      {/* Caja 1: Información personal */}
      <div className="profile-box">
        <div className="profile-header">
          <img
            src={avatar}
            alt="avatar"
            className="profile-avatar"
            onClick={() => setModalAbierto(true)}
            style={{ cursor: "pointer" }}
          />
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

      {/* Modal de selección de avatar */}
      {modalAbierto && (
        <div className="avatar-modal-overlay" onClick={() => setModalAbierto(false)}>
          <div className="avatar-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Selecciona tu avatar</h2>
            <div className="avatar-grid">
              {avatarsDisponibles.map(a => (
                console.log(a._id, a.url) || (
                  <img
                    key={a._id}
                    src={a.url}
                    alt="avatar"
                    className="avatar-option"
                    onClick={() => handleSeleccionarAvatar(a._id)}
                  />
                )
              ))}
            </div>
            <button className="avatar-close-btn" onClick={() => setModalAbierto(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
