import { useState, useEffect } from "react";
import { useMediaQuery, Box, Button, IconButton } from "@mui/material";
import SportsKabaddiIcon from "@mui/icons-material/SportsKabaddi";
import StorageIcon from "@mui/icons-material/Storage";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import CollectionsIcon from "@mui/icons-material/Collections";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import ActualMap from "../../components/MenuComponents/ActualMap/ActualMap";
import Maps from "../../components/MenuComponents/Maps/Maps";
import UserProfile from "../../components/MenuComponents/UserProfile/UserProfile";
import Decks from "../../components/MenuComponents/Decks/Decks";

import { cargarPartida } from "../../services/Actions/MenuActions";
import { useNavigate } from 'react-router-dom';

import "./Menu.css";

function Menu({data}) {
  const esMovil = useMediaQuery("(max-width:435px)");

  const botones = [
    { id: "batalla", icon: <SportsKabaddiIcon />, texto: "Batalla" },
    { id: "coleccion", icon: <CollectionsIcon />, texto: "Colección" },
    { id: "perfil", icon: <AccountCircleIcon />, texto: "Perfil" },
    { id: "salir", icon: <ExitToAppIcon />, texto: "Salir" },
    { id: "bbdd", icon: <StorageIcon />, texto: "BBDD" },
  ];

  const [seccionActiva, setSeccionActiva] = useState("batalla");
  const [showGestion, setShowGestion] = useState(false);
  const [selectedMap, setSelectedMap] = useState(null);
  const [selectedDeckId, setSelectedDeckId] = useState("");
  const navigate = useNavigate();

 
  

    useEffect(() => {
      if (!data) return;

      console.log('hola2', data);

      if (data.rol === "admin") {
        setShowGestion(true);
      }

      if (!selectedMap && data.maps?.length) {
        const firstAvailable = data.maps.find((m) => m.available);
        if (firstAvailable) {
          setSelectedMap(firstAvailable);
        }
      }
    }, [data, selectedMap]);

    if (!data) {
          return <div>Cargando datos...</div>;
        }
  
  

  const handleMapSelect = (mapa) => {
    if (mapa.available) {
      setSelectedMap(mapa);
    }
  };

  const handlePlay = async () => {
    if (selectedMap && selectedDeckId) {
      console.log(
        `Iniciar juego en: ${selectedMap.name} con el mazo ID: ${selectedDeckId}`
      );
      try {
        const resultado = await cargarPartida(selectedDeckId, selectedMap);
        console.log("Partida iniciada con éxito:", resultado);
        navigate("/game");
      } catch (error) {
        console.error("Error al iniciar la partida desde el menú" + error);
      }
    }
  };


    const renderContenido = () => {
      switch (seccionActiva) {
        case "batalla":
          return (
            <>
              <ActualMap
                mapa={selectedMap}
                onPlay={handlePlay}
                decks={data.decks}
                selectedDeckId={selectedDeckId}
                onSelectDeck={setSelectedDeckId}
              />
              <Maps mapas={data.maps} onSelect={handleMapSelect} />
            </>
          );
        case "coleccion":
          console.log("Decks:", data.decks);
          return (
            <>
              <Decks
                decks={data.decks}
              />
            </>
          );
        case "perfil":
          return ( 
          <UserProfile
            className="user-profile"
            avatar={data.playerAvatar}
            nickName={data.nickName}
            name={data.playerName}
            level={data.playerLevel}
            experience={data.playerExperience}
          />
        );
        case "bbdd":
          return <div className="section-placeholder">[Herramientas BBDD]</div>;
        case "salir":
          return <div className="section-placeholder">[Cerrar sesión]</div>;
        default:
          return null;
      }
    };

  return (
    <>
    <img src="/public/LOGO.png" alt="Logo DeskLords" className="menu-logo" />
      <Box className="main-content">{renderContenido()}</Box>
      {esMovil ? (
        <Box className="bottom-nav">
          {botones.map((btn) => (
            <Box key={btn._id} className="bottom-nav-item">
              <IconButton
                className="bottom-nav-btn"
                onClick={() => setSeccionActiva(btn._id)}
              >
                {btn.icon}
              </IconButton>
            </Box>
          ))}
        </Box>
      ) : (
        <Box className="gestion-container">
          <Box className="gestion-buttons">
            {botones.map((btn) => (
              <button
                key={btn._id}
                className="custom-btn"
                onClick={() => setSeccionActiva(btn._id)}
              >
                {btn.texto}
              </button>
            ))}
          </Box>
        </Box>
      )}
    </>
  );
}

export default Menu;
