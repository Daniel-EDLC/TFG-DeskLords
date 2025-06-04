import React, { useState, useEffect } from 'react';
import { Container, Box, Typography } from '@mui/material';
import PlayerProfile from '../../components/GameComponents/PlayerProfile/PlayerProfile';
import RivalProfile from '../../components/GameComponents/RivalProfile/RivalProfile';
import PlayerHand from '../../components/GameComponents/PlayerHand/PlayerHand';
import RivalHand from '../../components/GameComponents/RivalHand/RivalHand';
import RivalTable from '../../components/GameComponents/RivalTable/RivalTable';
import PlayerTable from '../../components/GameComponents/PlayerTable/PlayerTable';
import Announcement from '../../components/GameComponents/Announcement/Announcement';
import TurnIndicator from '../../components/GameComponents/TurnIndicator/TurnIndicator';
import { useLocation } from 'react-router-dom';

import './Game.css';
import useLoadMatch from '../../services/LoadMatch/LoadMatch';
import {
  playCard,
  switchPhase,
  endTurn,
  addCardToBattle,
  defense,
  resetBattle,
  getBattle,
  onSurrender
} from '../../services/Actions/GameActions';

function Game() {
  
  const location = useLocation();
  const partida = location.state?.partida;


  const [gameData, setGameData] = useState(partida);

  
  const phaseTurn = gameData?.turn?.phase;
  const whoseTurn = gameData?.turn?.whose;

  const [battles, setBattles] = useState([]);
  const [selectedTableCardIdForEquipment, setSelectedTableCardIdForEquipment] = useState(null);
  const [selectedTableCardIdforSpell, setSelectedTableCardIdforSpell] = useState(null);
  const [pendingEquipementCard, setPendingEquipementCard] = useState(null);
  const [pendingSpellCard, setPendingSpellCard] = useState(null);
  const [attackers, setAttackers] = useState([]);
  const [pendingCard, setPendingCard] = useState(null); // { id, type }

  const [announcementLink, setAnnouncementLink] = useState('');
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [isWinner, setIsWinner] = useState(null);


  const [draggingType, setDraggingType] = useState(null);

  const [floatingMessage, setFloatingMessage] = useState('');
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (floatingMessage) {
      setIsFading(false);
      const fadeTimer = setTimeout(() => setIsFading(true), 2500);
      const removeTimer = setTimeout(() => setFloatingMessage(''), 3000);
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [floatingMessage]);




  const handleRivalCardClick = (card) => {
    if (card.position !== 'attack') {
      alert('la carta no puede entrar en batalla');
      return;
    }
    const addedBattle = addCardToBattle(card);
    if (addedBattle) updateBattles();
  };

  const handlePlayerCardClick = (card) => {
    if (card.position !== 'defense') {
      alert('la carta no puede entrar en batalla');
      return;
    }
    const addedBattle = addCardToBattle(card);
    if (addedBattle) updateBattles();
  };

  const handlePlayCard = (card) => {
    if (card.type === 'equipement' && !card.targetId) {
      setPendingEquipementCard(card);
      return;
    }
    if (card.type === 'spell' && !card.targetId) {
      setPendingSpellCard(card);
      return;
    }
    playCard(setGameData, gameData, card);
  };

  const handleSwitchPhase = () => switchPhase(setGameData, gameData);
  const handleEndTurn = async (selectedAttackCards) => await endTurn(selectedAttackCards, setGameData, gameData, setFloatingMessage);
  const handleDefense = async () => {
  try {
    await defense(setGameData, gameData);
    resetBattle();
    setBattles([]);
  } catch (error) {
    console.error('Error al ejecutar defense:', error);
    // Aquí puedes manejar errores si quieres mostrar un mensaje al usuario
  }
};

  // const setPhase = (nuevaFase) => {
  //   setGameData((prevData) => ({
  //     ...prevData,
  //     turn: {
  //       ...prevData.turn,
  //       phase: nuevaFase
  //     }
  //   }));
  // };

  useEffect(() => {
    if (pendingEquipementCard && selectedTableCardIdForEquipment) {
      playCard(setGameData, gameData, {
        ...pendingEquipementCard,
        targetId: selectedTableCardIdForEquipment
      });
      setPendingEquipementCard(null);
      setSelectedTableCardIdForEquipment(null);
    }
  }, [pendingEquipementCard, selectedTableCardIdForEquipment]);

  useEffect(() => {
    if (pendingSpellCard && selectedTableCardIdforSpell) {
      playCard(setGameData, gameData, {
        ...pendingSpellCard,
        targetId: selectedTableCardIdforSpell
      });
      setPendingSpellCard(null);
      setSelectedTableCardIdforSpell(null);
    }
  }, [pendingSpellCard, selectedTableCardIdforSpell, setGameData]);

  useEffect(() => {
    if (!gameData || !gameData.rival) return;
    const nuevasCartas = gameData.rival.table.filter(carta => carta.position === 'attack');
    if (nuevasCartas.length > 0) {
      console.log(attackers);
      setAttackers(nuevasCartas);
    }
  }, [gameData]);

  useEffect(() => {
    if (!gameData?.turn?.phase) return;

    if (gameData.user.health <= 0 || gameData.rival.health <= 0) {
      setGameEnded(true);
      setIsWinner(gameData.user.health > 0);
      return;
    }

    //  let link = '';
    // switch (gameData.turn.phase) {
    //   case 'hand':
    //     link = gameData.turn.whose === 'user' ? '/FASEMANOPLAYERFINAL.png' : '/FASEMANORIVALFINAL.png';
    //     break;
    //   case 'attack':
    //     link = '/FASEATAQUEFINAL.png';
    //     break;
    //   case 'defense':
    //     link = '/FASEDEFENSAFINAL.png';
    //     break;
    //   default:
    //     link = '';
    // }

    // if (link) {
    //   setAnnouncementLink(link);
    //   setShowAnnouncement(true);
    // }
  }, [phaseTurn, whoseTurn, gameData?.user?.health, gameData?.rival?.health]);

  const updateBattles = () => {
    const currentBattles = getBattle();
    setBattles([...currentBattles]);
  };

  const handleResetBattle = () => {
    resetBattle();
    setBattles([]);
  };

  const handleSurrenderClick = async () => {
  try {
    await onSurrender(gameData); 
    setGameEnded(true);
    setIsWinner(false);
  } catch (error) {
    console.error('No se pudo rendir');
  }
};

  if (!gameData || !gameData.rival || !gameData.user || !gameData.turn) {
    return (
      <div className="loading-container">
        <div className="loading-box">
          <h2>Cargando partida...</h2>
          <p>Por favor, espera unos segundos</p>
        </div>
      </div>
    );
  }
console.log("partida->",gameData.user.hand)
  return (
    <div className="app-container">
      <RivalProfile
        className="rival-profile"
        name="Rival"
        imageUrl="https://m.media-amazon.com/images/I/51hPfLUZE0L._AC_UL1002_.jpg"
        life={gameData.rival.health}
        mana={gameData.rival.mana}
        deck={gameData.rival.pending_deck}
      />

      <RivalHand cantidad={gameData.rival.hand || 0} />

      <div className="mesa-container">
        <RivalTable
          cartas={gameData.rival.table}
          turn={gameData.turn}
          battles={battles}
          targetEquipmentCard={setSelectedTableCardIdForEquipment}
          targetSpellCard={setSelectedTableCardIdforSpell}
          isSelectingTargetForSpell={!!pendingSpellCard}
          isSelectingTargetForEquipment={!!pendingEquipementCard}
          mana={gameData.user.mana}
          onCardClick={handleRivalCardClick}
          onPlayCard={handlePlayCard}
          draggingType={draggingType}
          pendingCard={pendingCard}
           setPendingCard={setPendingCard}
        />

        <PlayerTable
          cartas={gameData.user.table}
          turn={gameData.turn}
          // onRequestPhaseChange={setPhase}
          handleSwitchPhase={handleSwitchPhase}
          handleEndTurn={handleEndTurn}
          handleDefense={handleDefense}
          targetEquipmentCard={setSelectedTableCardIdForEquipment}
          targetSpellCard={setSelectedTableCardIdforSpell}
          isSelectingTargetForEquipment={!!pendingEquipementCard}
          isSelectingTargetForSpell={!!pendingSpellCard}
          onCardClick={handlePlayerCardClick}
          battles={battles}
          onResetBattle={handleResetBattle}
          mana={gameData.user.mana}
          onPlayCard={handlePlayCard}
          draggingType={draggingType}
          pendingCard={pendingCard}
           setPendingCard={setPendingCard}
        />
      </div>

      <PlayerHand
        cartas={gameData.user.hand}
        mana={gameData.user.mana}
        turn={gameData.turn}
        onPlayCard={handlePlayCard}
        selectedTableCardIdForEquipment={selectedTableCardIdForEquipment}
        selectedTableCardIdForSpell={selectedTableCardIdforSpell}
        setDraggingType={setDraggingType}
        setPendingCard={setPendingCard}
        setFloatingMessage={setFloatingMessage}
      />

      <PlayerProfile
        className="player-profile"
        name="Jugador 1"
        imageUrl="https://img.freepik.com/fotos-premium/angel-cara-angel-alas_901383-148607.jpg"
        life={gameData.user.health}
        mana={gameData.user.mana}
        deck={gameData.user.pending_deck}
        onSurrender={handleSurrenderClick}
      />

      <TurnIndicator turn={gameData.turn} />

     {showAnnouncement && (
        <Announcement
          link={announcementLink}
          duration={2000}
          onFinish={() => setShowAnnouncement(false)}
        />
      )}
      {gameEnded && (
        <div className="end-overlay">
          <img
            src={isWinner ? "/VICTORIAFINAL.png" : "/DERROTAFINAL.png"}
            alt={isWinner ? "Victoria" : "Derrota"}
            className="end-logo"
          />
          {isWinner ? (
            <button className="end-button" onClick={() => window.location.href = "/menu"}>
              Volver al menú
            </button>
          ) : (
            <div className="end-buttons-container">
              <button className="end-button" onClick={() => window.location.reload()}>
                Reiniciar partida
              </button>
              <button className="end-button" onClick={() => window.location.href = "/menu"}>
                Volver al menú
              </button>
            </div>
          )}
        </div>
      )} 
      {floatingMessage && (
  <div className={`floating-overlay ${isFading ? 'fade-out' : ''}`}>
    <div className="floating-message">{floatingMessage}</div>
  </div>
)}
    </div>
    
  );
}

export default Game;



