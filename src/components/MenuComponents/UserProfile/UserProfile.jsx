import React, { useState, useEffect } from "react";
import "./UserProfile.css";
import {} from "../../../services/Actions/MenuActions";
import { signOut } from "firebase/auth";
import { useMediaQuery } from "@mui/material";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

import EditIcon from "@mui/icons-material/Edit"; // ya viene con MUI
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

import { auth } from "../../../../firebaseConfig";

import { useNavigate } from "react-router-dom";

const UserProfile = ({
  avatar,
  avatars = [],
  name,
  level,
  battlePassLvl,
  experience,
  rol,
  partidasGanadas,
  partidasPerdidas,
  favoriteDeck,
  onChangeAvatar,
  onChangeName,
}) => {
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUserEmail(currentUser.email);
    }
  }, []);

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(name);

  const handleGuardarNombre = async () => {
    try {
      if (onChangeName) {
        await onChangeName(editedName);
      }
      setIsEditingName(false);
    } catch (error) {
      alert("Error al actualizar el nombre", error);
    }
  };

const handleSeleccionarAvatar = async (avatarId) => {
  if (onChangeAvatar) {
    await onChangeAvatar(avatarId);
  }
  setModalAbierto(false); 
};




  const [modalAbierto, setModalAbierto] = useState(false);

  const experienciaPorNivel = 1000;
  const progreso = Math.min(
    ((experience % experienciaPorNivel) / experienciaPorNivel) * 100,
    100
  );
  const totalPartidas = partidasGanadas + partidasPerdidas;
  const victoryPercent =
    totalPartidas > 0 ? Math.round((partidasGanadas / totalPartidas) * 100) : 0;

  const avatarsDisponibles = avatars.filter((a) => a.available);
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:435px)");

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
            <div className="profile-username-wrapper">
              {isEditingName ? (
                <div className="profile-username-edit">
                  <input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="profile-username-input"
                  />
                  <div>
                    <CheckIcon
                      onClick={(e) => {
                        e.preventDefault();
                        handleGuardarNombre();
                      }}
                      className="profile-username-icon confirm"
                    />
                    <CloseIcon
                      onClick={() => {
                        setIsEditingName(false);
                        setEditedName(name);
                      }}
                      className="profile-username-icon cancel"
                    />
                  </div>
                </div>
              ) : (
                <h2 className="profile-username">
                  {editedName}
                  <EditIcon
                    className="profile-username-icon"
                    onClick={() => setIsEditingName(true)}
                  />
                </h2>
              )}
            </div>

            <p className="profile-role">Rol: {rol}</p>
            <p className="profile-email">{userEmail}</p>
          </div>
        </div>
        <div className="profile-favorite-deck">
          <h3>Mazo más usado</h3>
          <p>{favoriteDeck}</p>
        </div>
      </div>

      {/* Caja 2: Stats */}
      <div className="profile-box">
        <div className="profile-level">
          <div className="profile-levels">
            <p>Nivel de cuenta {level}</p>
            <p>Nivel BP actual {battlePassLvl}</p>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progreso}%` }}
            ></div>
          </div>
          <span>
            {experience % experienciaPorNivel} / {experienciaPorNivel} XP
          </span>
        </div>

        <div className="profile-stats-circular">
          <div
            className="circular-chart"
            style={{
              background: `conic-gradient(#c0b303 ${victoryPercent}%, rgba(255,255,255,0.1) 0)`,
            }}
          >
            <span>{victoryPercent}%</span>
          </div>

          <div className="circular-legend">
            <p>Ganadas: {partidasGanadas}</p>
            <p>Perdidas: {partidasPerdidas}</p>
          </div>
        </div>
      </div>

      {isMobile && (
        <button
          className="logout-btn-mobile"
          onClick={() => signOut(auth) && navigate("/")}
        >
          salir
        </button>
      )}

      {/* Modal de selección de avatar */}
      {modalAbierto && (
        <div
          className="avatar-modal-overlay"
          onClick={() => setModalAbierto(false)}
        >
          <div className="avatar-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Selecciona tu avatar</h2>
            <div className="avatar-grid">
              {avatarsDisponibles.map(
                (a) =>
                  console.log(a._id, a.url) || (
                    <img
                      key={a._id}
                      src={a.url}
                      alt="avatar"
                      className="avatar-option"
                      onClick={(e) => {
                        e.preventDefault();
                        handleSeleccionarAvatar(a._id);
                      }}
                    />
                  )
              )}
            </div>

            <button
              type="button"
              className="avatar-close-btn"
              onClick={() => setModalAbierto(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
