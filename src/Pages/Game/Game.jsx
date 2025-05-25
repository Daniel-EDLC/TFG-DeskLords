
import React, { useState , useEffect } from 'react';
import { Container, Box, Typography } from '@mui/material';
import PlayerProfile from '../../components/GameComponents/PlayerProfile/PlayerProfile';
import RivalProfile from '../../components/GameComponents/RivalProfile/RivalProfile';
import PlayerHand from '../../components/GameComponents/PlayerHand/PlayerHand';
import RivalHand from '../../components/GameComponents/RivalHand/RivalHand';
import RivalTable from '../../components/GameComponents/RivalTable/RivalTable';
import PlayerTable from '../../components/GameComponents/PlayerTable/PlayerTable';
import Announcement from '../../components/GameComponents/Announcement/Announcement'; 



import './Game.css'

import useLoadMatch from '../../services/LoadMatch/LoadMatch';

import { playCard, switchPhase, endTurn, addCardToBattle, defense, resetBattle, getBattle } from '../../services/Actions/GameActions';

function Game() {

  const [gameData, setGameData] = useLoadMatch();

  const phaseTurn = gameData?.turn?.phase;
  const whoseTurn = gameData?.turn?.whose;

  const [battles, setBattles] = useState([]);

  const [selectedTableCardId, setSelectedTableCardId] = useState(null);

  const [pendingEquipementCard, setPendingEquipementCard] = useState(null);

  const [attackers, setAttackers] = useState([]);

  const [announcementLink, setAnnouncementLink] = useState('');
  const [showAnnouncement, setShowAnnouncement] = useState(false);

  const handleRivalCardClick = (card) => {
    if (card.position !== 'attack') {
      alert('la carta no puede entrar en batalla');
      return null;
    }
    const addedBattle = addCardToBattle(card);
    if (addedBattle) {
      updateBattles();
    }
  };

  const handlePlayerCardClick = (card) => {
    if (card.position !== 'defense') {
      alert('la carta no puede entrar en batalla');
      return null;
    }
    const addedBattle = addCardToBattle(card);
  if (addedBattle) {
    updateBattles();
  }
  };

const handlePlayCard = (card) => {
  if (card.type === 'equipement' && !card.targetId) {
    setPendingEquipementCard(card);
    return;
  }

  if (card.type === 'spell' && !card.targetId) {
    setPendingEquipementCard(card);
    return;
  }

  playCard(setGameData, card);
};


  const handleSwitchPhase = () => {
    switchPhase(setGameData);
  };

  const handleEndTurn = async (selectedAttackCards) => {
    await endTurn(selectedAttackCards, setGameData);
  };

  const handleDefense = async () => {
    await defense(setGameData, gameData);
  };

  const setPhase = (nuevaFase) => {
    setGameData((prevData) => ({
      ...prevData,
      turn: {
        ...prevData.turn,
        phase: nuevaFase
      },
    }));
  };


  useEffect(() => {
    if (pendingEquipementCard && selectedTableCardId) {
      playCard(setGameData, {
        ...pendingEquipementCard,
        targetId: selectedTableCardId
      });
      setPendingEquipementCard(null);
      setSelectedTableCardId(null);
    }
  }, [pendingEquipementCard, selectedTableCardId, setGameData]);

  useEffect(() => {
    if (!gameData || !gameData.rival) return;
        const nuevasCartas = gameData.rival.table.filter(carta => carta.position === 'attack');
        if (nuevasCartas.length > 0) {
          console.log(attackers)
        setAttackers(nuevasCartas);
        return;
      }
  }, [gameData]);


useEffect(() => {
  if (!gameData?.turn?.phase) return;

  let link = '';
  switch (gameData.turn.phase) {
    case 'hand':
      link = gameData.turn.whose === 'user' ? '/FASEMANOPLAYERFINAL.png' : '/FASEMANORIVALFINAL.png';
      break;
    case 'table':
      link = '/FASEATAQUEFINAL.png';
      break;
    case 'defense':
      link = '/FASEDEFENSAFINAL.png';
      break;
    case 'attack':
    link = '/FASEATAQUEFINAL.png';
      break;
    default:
      link = '';
  }

  if (link) {
    setAnnouncementLink(link);
    setShowAnnouncement(true);
  }
}, [phaseTurn, whoseTurn]);

const updateBattles = () => {
  const currentBattles = getBattle();
  setBattles([...currentBattles]);
};

const handleResetBattle = () => {
  resetBattle();
  setBattles([]);
};


  if (!gameData ||  !gameData.rival ||  !gameData.user ||  !gameData.turn) {
    return (
      <div className="loading-container">
        <div className="loading-box">
          <h2>Cargando partida...</h2>
          <p>Por favor, espera unos segundos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <RivalProfile 
        className="rival-profile" 
        name="Rival" 
        imageUrl="https://m.media-amazon.com/images/I/51hPfLUZE0L._AC_UL1002_.jpg" 
        life = {gameData.rival.health}
        mana = {gameData.rival.mana}
      />
        <RivalHand 
          cantidad={gameData.rival.hand || 0}
        />
      <div className="mesa-container">
        <RivalTable 
          cartas={gameData.rival.table || []}
          turn={gameData.turn}
          onCardClick={handleRivalCardClick}
        />
        <PlayerTable
          cartas={gameData.user.table || []}
          turn={gameData.turn}
          onRequestPhaseChange={setPhase}
          switchPhase={handleSwitchPhase}
          handleEndTurn={handleEndTurn}
          handleDefense={handleDefense}
          targetEquipmentCard={setSelectedTableCardId}
          isSelectingTargetForEquipment={!!pendingEquipementCard}
          onCardClick={handlePlayerCardClick}
          battles={battles}
          onResetBattle={handleResetBattle}
          mana={gameData.user.mana}
          selectedTableCardId={selectedTableCardId}
          onPlayCard={handlePlayCard}
        />
      </div>
        <PlayerHand 
            cartas={gameData.user.hand || []}
            mana={gameData.user.mana}
            phase={gameData.turn.phase}
            onPlayCard={handlePlayCard}
            selectedTableCardId={selectedTableCardId}
        />
        <PlayerProfile 
          className="player-profile" 
          name="Jugador 1" 
          imageUrl="https://img.freepik.com/fotos-premium/angel-cara-angel-alas_901383-148607.jpg" 
          life={gameData.user.health}
          mana={gameData.user.mana}
      />
      {showAnnouncement && (
        <Announcement
          link={announcementLink}
          duration={2000}
          onFinish={() => setShowAnnouncement(false)}
        />
      )}
    </div>
  )
}

export default Game
