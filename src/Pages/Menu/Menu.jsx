import { useState, useEffect } from "react";
import { useMediaQuery, Box, Button, IconButton, Dialog } from "@mui/material";
import SportsKabaddiIcon from "@mui/icons-material/SportsKabaddi";
import StorageIcon from "@mui/icons-material/Storage";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import CollectionsIcon from "@mui/icons-material/Collections";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import HomeIcon from '@mui/icons-material/Home';

import ActualMap from "../../components/MenuComponents/ActualMap/ActualMap";
import Maps from "../../components/MenuComponents/Maps/Maps";
import UserProfile from "../../components/MenuComponents/UserProfile/UserProfile";
import Decks from "../../components/MenuComponents/Decks/Decks";
import News from "../../components/MenuComponents/News/News";
import Shop from "../../components/MenuComponents/Shop/Shop";
import Missions from "../../components/MenuComponents/Missions/Missions";

import {
  cargarPartida,
  cargaInformacion,
} from "../../services/Actions/MenuActions";
import { useNavigate } from "react-router-dom";

import "./Menu.css";

function Menu() {
  const esMovil = useMediaQuery("(max-width:435px)");
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [seccionActiva, setSeccionActiva] = useState("inicio");
  const [showGestion, setShowGestion] = useState(false);
  const [selectedMap, setSelectedMap] = useState(null);
  const [selectedDeckId, setSelectedDeckId] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);

  const botones = [
    { id: "inicio", icon: <HomeIcon />, texto: "Inicio" },
    { id: "coleccion", icon: <CollectionsIcon />, texto: "Colección" },
    { id: "perfil", icon: <AccountCircleIcon />, texto: "Perfil" },
    { id: "batalla", icon: <SportsKabaddiIcon />, texto: "Batalla" },
    { id: "bbdd", icon: <StorageIcon />, texto: "BBDD" },
  ];

  useEffect(() => {
    const cargar = async () => {
      try {
        const resultado = await cargaInformacion();
        setData(resultado);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };
    cargar();
  }, []);

  useEffect(() => {
    if (!data) return;

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

  const handleMapSelect = (mapa) => {
    if (mapa.available) {
      setSelectedMap(mapa);
    }
  };

  const handlePlay = async () => {
    if (selectedMap && selectedDeckId) {
      console.log("mapa:", selectedMap);
      console.log("deck:", selectedDeckId);
      try {
        const gameData = await cargarPartida(selectedDeckId, selectedMap.id);
        navigate("/game", { state: { partida: gameData } });
      } catch (error) {
        console.error("Error al iniciar la partida:", error);
      }
    }
  };

  const renderContenido = () => {
    switch (seccionActiva) {
      case "inicio":
        return (
          <div className="inicio-layout">
            <div className="inicio-columna izquierda">
              <News noticias={data.news} />
            </div>
            <div className="inicio-columna derecha">
              <div className="inicio-columna-derecha-arriba">
                <div className="play-card" onClick={() => setModalAbierto(true)}>
                  <img
                    src="https://platform.polygon.com/wp-content/uploads/sites/2/chorus/uploads/chorus_asset/file/24596644/Elspeths_Smite_Artist_Livia_Prima_cropped.jpg?quality=90&strip=all&crop=7.8%2C0%2C84.4%2C100&w=2400"
                    className="play-imagen"
                  />
                  <h1 className="play-text">Play!</h1>
                </div>
                <Shop decks={data.decks} />
              </div>
              <div className="inicio-missions">
                <Missions misiones={data.missions} />
              </div>
            </div>
          </div>
        );
      case "coleccion":
        return <Decks decks={data.decks} />;
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
      case "batalla":
        return (
          <div className="maps-container">
            <ActualMap
              mapa={selectedMap}
              onPlay={handlePlay}
              decks={data.decks}
              selectedDeckId={selectedDeckId}
              onSelectDeck={setSelectedDeckId}
            />
            <Maps mapas={data.maps} onSelect={handleMapSelect} />
          </div>
        );
      default:
        return null;
    }
  };

  if (!data) {
    return (
      <div className="loading-container">
        <div className="loading-box">
          <p>Espera unos segundos...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {esMovil ? (
        <>
          <img src="/LOGO.png" alt="Logo DeskLords" className="menu-logo" />
          <Box className="main-content">
            <Box className="menu-scroll-content">{renderContenido()}</Box>
          </Box>
          <Box className="bottom-nav">
            {botones.map((btn) => (
              <Box key={btn.id} className="bottom-nav-item">
                <IconButton
                  className="bottom-nav-btn"
                  onClick={() => setSeccionActiva(btn.id)}
                >
                  {btn.icon}
                </IconButton>
              </Box>
            ))}
          </Box>
        </>
      ) : (
        <>
          <Box className="gestion-container">
            <img src="/LOGO.png" alt="Logo DeskLords" className="nav-logo" />
            <Box className="gestion-buttons">
              {botones
                .filter((btn) => esMovil || btn.id !== "batalla")
                .map((btn) => (
                  <button
                    key={btn.id}
                    className="custom-btn"
                    onClick={() => setSeccionActiva(btn.id)}
                  >
                    {btn.texto}
                  </button>
                ))}
            </Box>
            <div className="gestion-shape"></div>
            <button className="logout-btn">
              <ExitToAppIcon />
            </button>
          </Box>

          <Box className="main-content">
            <Box className="menu-scroll-content">{renderContenido()}</Box>
          </Box>
        </>
      )}

      {/* Modal de batalla desde Play */}
      <Dialog open={modalAbierto} onClose={() => setModalAbierto(false)} maxWidth="xl" className="modal-maps-container" PaperProps={{style: {backgroundColor: 'transparent', boxShadow: 'none',},}}>
          <Box className="maps-container">
            <ActualMap
              mapa={selectedMap}
              onPlay={handlePlay}
              decks={data.decks}
              selectedDeckId={selectedDeckId}
              onSelectDeck={setSelectedDeckId}
            />
            <Maps mapas={data.maps} onSelect={handleMapSelect} />
          </Box>
      </Dialog>
    </>
  );
}

export default Menu;
