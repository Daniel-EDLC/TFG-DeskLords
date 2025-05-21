import React, { useEffect, useState } from 'react';
import Maps from '../../components/MenuComponents/Maps/Maps';
import UserProfile from '../../components/MenuComponents/UserProfile/UserProfile';
import ActualMap from '../../components/MenuComponents/ActualMap/ActualMap';
import { useNavigate } from 'react-router-dom';

import './Menu.css';
import { cargarPartida } from '../../services/Actions/MenuActions';


import { Navigate } from 'react-router-dom';

function Menu({ data }) {
  const [showGestion, setShowGestion] = useState(false);
  const [selectedMap, setSelectedMap] = useState(null);
  const [selectedDeckId, setSelectedDeckId] = useState('');
  const navigate = useNavigate();

    

    useEffect(() => {
    if (data?.habilitarGestion) {
      setShowGestion(true);
    }

    // Seleccionar el primer mapa disponible por defecto
    if (!selectedMap && data?.mapas?.length) {
      const firstAvailable = data.mapas.find(m => m.available);
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
  
          console.log(`Iniciar juego en: ${selectedMap.nombre} con el mazo ID: ${selectedDeckId}`);
    try {
      const resultado = await cargarPartida(selectedDeckId, selectedMap);
      console.log('Partida iniciada con éxito:', resultado);
      navigate('/game');
    } catch (error) {
      console.error('Error al iniciar la partida desde el menú'+ error);
    }
  
    
  }
};


  if (!data) {
      return <div>Cargando datos...</div>;
    }
    
  return (
    <div className="menu-container">
      <div className="menu-header">
        <img className='menu-tittle' src="/public/LOGO.png" alt="" />
      </div>

      <div className="menu-main">
        <div className="perfil-area">
          <UserProfile
            avatar={data.playerAvatar}
            name={data.playerName}
            level={data.playerLevel}
            experience={data.playerExperience}
          />
        </div>

        <div className="middle-area">
          <ActualMap
            mapa={selectedMap}
            onPlay={handlePlay}
            decks={data.decks}
            selectedDeckId={selectedDeckId}
            onSelectDeck={setSelectedDeckId}
          />
        </div>

        <div className="maps-area">
          <Maps mapas={data.mapas} onSelect={handleMapSelect} />
        </div>
      </div>

      <div className="menu-footer">
        {/* {showGestion && <Gestion />} */}
      </div>
    </div>
  );
}

export default Menu;

