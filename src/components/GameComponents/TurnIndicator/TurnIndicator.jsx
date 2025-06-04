import React from 'react';
import PanToolAltIcon from '@mui/icons-material/PanToolAlt';
import GavelIcon from '@mui/icons-material/Gavel';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import PanToolIcon from '@mui/icons-material/PanTool';


import SecurityIcon from '@mui/icons-material/Security';
import './TurnIndicator.css';

export default function TurnIndicator({ turn }) {
  if (!turn) return null;

  const { phase, whose } = turn;
  const isPlayerTurn = whose === 'user';
  console.log(turn)
  return (
    <div className={`turn-indicator ${!isPlayerTurn ? 'rival' : 'player'}`}>
      {!isPlayerTurn && <div className="info-rival">Turno rival</div>}
      {isPlayerTurn && <div className="info-player">Tu turno</div>}
      <div className="icons">
        <div className={`icon ${phase === 'hand' ? 'active' : ''}`} title="Fase de mano">
          <PanToolIcon fontSize="inherit" />
        </div>
        <div className={`icon ${(phase === 'table' || phase === 'attack') ? 'active' : ''}`} title="Fase principal / ataque">
          <MilitaryTechIcon fontSize="inherit" />
        </div>
        <div className={`icon ${phase === 'defense' ? 'active' : ''}`} title="Fase de combate">
          <SecurityIcon fontSize="inherit" />
        </div>
      </div>
    </div>
  );
}
