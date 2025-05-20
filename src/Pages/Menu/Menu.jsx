import React, { useEffect, useState } from 'react';
import Maps from '../../components/MenuComponents/Maps/Maps';
// import Gestion from '../../components/MenuComponents/Gestion/Gestion';
import PlayerProfile from '../../components/MenuComponents/PlayerProfile/PlayerProfile';

import './Menu.css';

function Menu({ data }) {
  const [showGestion, setShowGestion] = useState(false);

  useEffect(() => {
    if (data?.habilitarGestion) {
      setShowGestion(true);
    }
  }, [data]);

  return (
    <div className="menu-container">
      <div className="menu-header">
        <h1>Bienvenido al Juego</h1>
      </div>

      <div className="menu-main">
        <div className="perfil-area">
          <PlayerProfile
            avatar={data.playerAvatar}
            name={data.playerName}
            level={data.playerLevel}
            experience={data.playerExperience}
          />
        </div>
        <div className="maps-area">
          <Maps mapas={data.mapas} />
        </div>
      </div>

      <div className="menu-footer">
        {/* {showGestion && <Gestion />} */}
      </div>
    </div>
  );
}

export default Menu;
