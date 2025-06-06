import { useState, useEffect } from "react";
import { useMediaQuery, Box, IconButton, Dialog } from "@mui/material";
import SportsKabaddiIcon from "@mui/icons-material/SportsKabaddi";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../firebaseConfig";

import StorageIcon from "@mui/icons-material/Storage";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import CollectionsIcon from "@mui/icons-material/Collections";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import HomeIcon from "@mui/icons-material/Home";

import ActualMap from "../../components/MenuComponents/ActualMap/ActualMap";
import Maps from "../../components/MenuComponents/Maps/Maps";
import UserProfile from "../../components/MenuComponents/UserProfile/UserProfile";
import Decks from "../../components/MenuComponents/Decks/Decks";
import News from "../../components/MenuComponents/News/News";
import Shop from "../../components/MenuComponents/Shop/Shop";
import Missions from "../../components/MenuComponents/Missions/Missions";
import BattlePass from "../../components/MenuComponents/BattlePass/BattlePass";
import ContactUs from "../../components/MenuComponents/ContactUs/ContactUs";

import {
  cargarPartida,
  cargaInformacion,
} from "../../services/Actions/MenuActions";
import { useNavigate } from "react-router-dom";

import "./Menu.css";

function Menu() {
  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, (user) => {
  //     if (!user) {
  //       navigate('/');
  //     }
  //   });

  //   return () => unsubscribe();
  // }, [navigate]);



  const [showSplash, setShowSplash] = useState(true);
  const isMobile = useMediaQuery("(max-width:435px)");
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [seccionActiva, setSeccionActiva] = useState("inicio");
  // const [showGestion, setShowGestion] = useState(false);
  const [selectedMap, setSelectedMap] = useState(null);
  const [selectedDeckId, setSelectedDeckId] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);

  // const [isHovered, setIsHovered] = useState(false);

  console.log("Menu data:", data);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowSplash(false);
    }, 7000);
    return () => clearTimeout(timeout);
  }, []);

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

    // if (data.rol === "admin") {
    //   setShowGestion(true);
    // }

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
      try {
        const gameData = await cargarPartida(selectedDeckId, selectedMap.id);
        navigate("/game", { state: { partida: gameData } });
      } catch (error) {
        console.error("Error al iniciar la partida:", error);
      }
    }
  };

  if (!data) {
    return null;
  }

  const botones = [
    { id: "inicio", icon: <HomeIcon />, texto: "Inicio" },
    { id: "coleccion", icon: <CollectionsIcon />, texto: "Colección" },
    { id: "perfil", icon: <AccountCircleIcon />, texto: "Perfil" },
    { id: "batalla", icon: <SportsKabaddiIcon />, texto: "Batalla" },
    {
      id: data.rol === "admin" ? "gestion" : "contacto",
      icon: <StorageIcon />,
      texto: data.rol === "admin" ? "Gestión" : "Contacto",
    },
  ];
console.log("datos:", data.shop.decks);
  const renderContenido = () => {
    switch (seccionActiva) {
      case "inicio":
        return (
          <div>
            {isMobile ? (
              <div className="menu-mobile">
                <div className="menu-mobile-top">
                  <News noticias={data.news} />
                  <Shop shop={data.shop} />
                </div>
                <BattlePass nivelActual={6} />
                
              </div>
            ) : (
              <div className="inicio-layout">
                <div className="inicio-columna izquierda">
                  <News noticias={data.news} />
                </div>
                <div className="inicio-columna derecha">
                  <div className="inicio-columna-derecha-arriba">
                    <div
                      className="play-card"
                      onClick={() => setModalAbierto(true)}
                    >
                      <div className="card-image-wrapper">
                        <img
                          src="/imageBattle.png"
                          alt="estática"
                          className="static-img"
                        />
                        <img
                          src="https://cdna.artstation.com/p/assets/images/images/017/853/124/original/urban-bradesko-fx-02.gif?1557583057"
                          alt="gif"
                          className="gif-img"
                        />
                      </div>
                      <h1 className="play-text">Play!</h1>
                    </div>
                    <Shop shop={data.shop} coins={data.coins} />
                  </div>
                  <div className="inicio-battlePass">
                    <BattlePass nivelActual={6} />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case "coleccion":
        return <Decks decks={data.decks} />;
      case "perfil":
        return (
          
          <div className="perfil-container">
          <UserProfile
            className="user-profile"
            avatar={data.playerAvatar}
            nickName={data.nickName}
            name={data.playerName}
            level={data.playerLevel}
            experience={data.playerExperience}
            coins={data.coins}
            email={data.playerEmail || "No disponible"}
            rol={data.rol || "No disponible"}
            partidasGanadas={data.wins}
            partidasPerdidas={data.loses}
            mazoFavorito={data.favoriteDeck || "No disponible"}
          />
        </div>
      );
      // case "gestion":
      //   return (

      //   );
      case "contacto":
        return <ContactUs />;
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

  return (
    <>
      {isMobile ? (
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
                .filter((btn) => isMobile || btn.id !== "batalla")
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
            <button
              className="logout-btn"
              onClick={() => signOut(auth) && navigate("/")}
            >
              <ExitToAppIcon />
            </button>
          </Box>

          <Box className="main-content">
            <Box className="menu-scroll-content">{renderContenido()}</Box>
          </Box>
        </>
      )}

      <Dialog
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        maxWidth="xl"
        className="modal-maps-container"
        PaperProps={{
          style: {
            backgroundColor: "transparent",
            boxShadow: "none",
          },
        }}
      >
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

      {showSplash && (
        <div className="splash-screen">
          <div className="splash-wrapper">
            <img src="/LOGO.png" alt="Logo DeskLords" className="splash-logo" />
          </div>
        </div>
      )}
    </>
  );
}

export default Menu;
