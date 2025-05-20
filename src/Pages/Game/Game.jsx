
import React, { useState , useEffect } from 'react';
import { Container, Box, Typography } from '@mui/material';
import PlayerProfile from '../../components/GameComponents/PlayerProfile/PlayerProfile';
import RivalProfile from '../../components/GameComponents/RivalProfile/RivalProfile';
import PlayerHand from '../../components/GameComponents/PlayerHand/PlayerHand';
import RivalHand from '../../components/GameComponents/RivalHand/RivalHand';
import RivalTable from '../../components/GameComponents/RivalTable/RivalTable';
import PlayerTable from '../../components/GameComponents/PlayerTable/PlayerTable';

import './Game.css'

import useLoadMatch from '../../services/LoadMatch/LoadMatch';

import { playCard, switchPhase, attack, addCardToBattle, defense } from '../../services/Actions/GameActions';

function Game() {





const [gameData, setGameData] = useLoadMatch();
const [selectedTableCardId, setSelectedTableCardId] = useState(null);
const [pendingEquipementCard, setPendingEquipementCard] = useState(null);
const [attackers, setAttackers] = useState([]);




const handleRivalCardClick = (card) => {
  if (card.position !== 'attack') {
    alert('la carta no puede entrar en batalla');
    return null;
  }
  addCardToBattle(card);
};


const handlePlayerCardClick = (card) => {
  if (card.position !== 'defense') {
    alert('la carta no puede entrar en batalla');
    return null;
  }
  addCardToBattle(card);
};



const handlePlayCard = (card) => {
    if (card.type === 'equipement' && !selectedTableCardId) {
      setPendingEquipementCard(card);
      return;
    }
    if (card.type === 'spell' && !selectedTableCardId) {
      setPendingEquipementCard(card);
      return;
    }
    playCard(setGameData, card);
};


const handleSwitchPhase = () => {
  switchPhase(setGameData);
};


const handleAttack = async (selectedAttackCards) => {
  await attack(selectedAttackCards, setGameData);
};


const handleDefense = async () => {
  await defense(setGameData, gameData);
};


const setPhase = (nuevaFase) => {
    setGameData((prevData) => ({
      ...prevData,
      turn: {
        ...prevData.turn,
        phase: nuevaFase,
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
      setSelectedTableCardId(null); // limpiar selección
    }
  }, [pendingEquipementCard, selectedTableCardId, setGameData]);


useEffect(() => {
  if (!gameData || !gameData.rival) return;

      const nuevasCartas = gameData.rival.table.filter(carta => carta.position === 'attack');
      if (nuevasCartas.length > 0) {
      console.log('atacantes: ', nuevasCartas);
      setAttackers(nuevasCartas);
      return;
    }
    

}, [gameData]);



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

  // const cartas = ['/cards/card1.jpg','/cards/card2.jpg','/cards/card3.jpg','/cards/card4.jpg','/cards/card5.jpg','/cards/card6.jpg','/cards/card7.jpg',];
  // const cartas2 = ['/cards/cardBack.jpg','/cards/cardBack.jpg','/cards/cardBack.jpg','/cards/cardBack.jpg','/cards/cardBack.jpg','/cards/cardBack.jpg','/cards/cardBack.jpg',];
  // gameData.rival.mana = 10;
  // gameData.user.mana = 10;
  // gameData.rival.health = 100;
  // gameData.user.health = 100;
  // gameData.turn.phase = 'hand';


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
          phase={gameData.turn.phase}
          onCardClick={handleRivalCardClick}
        />
        <PlayerTable
          cartas={gameData.user.table || []}
          phase={gameData.turn.phase}
          onRequestPhaseChange={setPhase}
          switchPhase={handleSwitchPhase}
          handleAttack={handleAttack}
          handleDefense={handleDefense}
          targetEquipmentCard={setSelectedTableCardId}
          isSelectingTargetForEquipment={!!pendingEquipementCard}
          onCardClick={handlePlayerCardClick}
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
    </div>
    
  )
}

export default Game
