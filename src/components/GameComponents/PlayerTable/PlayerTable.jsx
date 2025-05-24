import React, { useState, useEffect } from 'react';
import { Box, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { endTurn } from '../../../services/Actions/GameActions';
import './PlayerTable.css';

function PlayerTable({ cartas, turn, onRequestPhaseChange, switchPhase, handleAttack, handleDefense, targetEquipmentCard, isSelectingTargetForEquipment,  onCardClick }) {

  const [selectedAttackCards, setselectedAttackCards] = useState([]);
  const [pendingCardId, setPendingCardId] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  const [hiddenCards, setHiddenCards] = useState([]);
  const [removedCards, setRemovedCards] = useState([]);

  const handleCardClick = (carta) => {

    if (turn.whose === 'user') {
      if (turn.phase === 'hand') {
        console.log("hola");
        if (isSelectingTargetForEquipment && targetEquipmentCard) {
          targetEquipmentCard(carta.id);
          return;
        }
        setPendingCardId(carta.id);
        setShowConfirmDialog(true);

      } else if (turn.phase === 'table') {
        toggleAttackCard(carta.id);

      } 
    }else if(turn.whose === 'rival'){
      if (turn.phase === 'attack') {
        console.log('Defender con carta:', carta);
        onCardClick(carta);
      }
    };
  }


  const toggleAttackCard = (id) => {
    setselectedAttackCards((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((cardId) => cardId !== id)
        : [...prevSelected, id]
    );
  };

  const handleAttackClick = async () => {
    if (selectedAttackCards.length === 0) return;

    try {
      await handleAttack(selectedAttackCards);  
      setselectedAttackCards([]);
    } catch (error) {
      console.error('Error al atacar:', error);
    }
  };

  const handleDefenseClick = async () => {
    try {
      await handleDefense();  
      setselectedAttackCards([]);
    } catch (error) {
      console.error('Error al defender:', error);
    }
  };


  const confirmPhaseChange = () => {
    if (onRequestPhaseChange) {
      onRequestPhaseChange('table');
    }
    setShowConfirmDialog(false);

    if (pendingCardId !== null) {
      toggleAttackCard(pendingCardId);
      setPendingCardId(null);
    }
  };

  const cancelPhaseChange = () => {
    setShowConfirmDialog(false);
    setPendingCardId(null);
  };

  useEffect(() => {
    cartas.forEach((carta) => {
      if (carta.alive === false && !hiddenCards.includes(carta.id)) {
        setTimeout(() => {
          setHiddenCards((prev) => [...prev, carta.id]);
        }, 1500);
      }
    });
  }, [cartas]);

  useEffect(() => {
    cartas.forEach((carta) => {
      if (carta.alive === false && !removedCards.includes(carta.id)) {
        setTimeout(() => {
          setRemovedCards((prev) => [...prev, carta.id]);
        }, 2500);
      }
    });
  }, [cartas]);

  const renderPhaseButtons = (turn) => {
    console.log(turn)
    if (turn.whose === 'user'){
      switch (turn.phase) {
          case 'hand':
            return (
              <>
                <Button variant="contained" className="phase-button" onClick={switchPhase}>
                  Fase mesa
                </Button>
                <Button variant="contained" className="end-turn-button" onClick={endTurn}>
                  Pasar turno
                </Button>
              </>
            );

          case 'table':
            return (
              <>
                {selectedAttackCards.length > 0 ? (
                  <Button variant="contained" className="phase-button" color="primary" onClick={handleAttackClick}>
                    Atacar y finalizar
                  </Button>
                ) : (
                  <Button variant="contained" className="end-turn-button" onClick={endTurn}>
                    Finalizar
                  </Button>
                )}
              </>
            );
            
          default:
            return null;

         

          
        }
    }else if(turn.whose === 'rival' && turn.phase === 'attack' ){
            return (
              <Button variant="contained" className="phase-button" color="primary" onClick={handleDefenseClick}>
                Defender y empezar turno
              </Button>
            );
    }
};

  return (
    <>
      <Box className="phase-buttons">
        {renderPhaseButtons(turn)}
      </Box>
      <Box className="player-table-container">

         {cartas.map((carta, index) => {
          if (removedCards.includes(carta.id)) return null;

          const isSelected = selectedAttackCards.includes(carta.id);
          const isFadingOut = hiddenCards.includes(carta.id);


          
          // const cardClass = `player-card-table ${carta.battle ? 'player-battle' : ''}`;
          // const cardClass = `player-card-table`;

          return (
            <div key={carta.id} className={`player-card-wrapper ${isFadingOut ? 'player-card-fade-out' : ''}`}>
              <div className={`player-card-table ${isSelected ? 'selected' : ''}`}>
                <Paper
                  elevation={10}
                  className="player-card-inner"
                  onClick={() => { handleCardClick(carta) }}
                >
                  <img
                    src={carta.image}
                    alt={`Carta ${index + 1}`}
                    className="player-card-image"
                  />

                  {carta.equipements && carta.equipements.length > 0 && (
                    <div className="player-equipment-count">
                      {carta.equipements.length}
                    </div>
                  )}

                  {isSelected && <div className="attack-label"></div>}

                  {carta.equipements && carta.equipements.length > 0 && (
                    <div className="player-equipment-preview">
                      {carta.equipements.map((equipo) => (
                        <img
                          key={equipo.id}
                          src={equipo.image}
                          alt={equipo.id}
                          className="player-equipment-image"
                        />
                      ))}
                    </div>
                  )}
                </Paper>
              </div>
            </div>
          );
        })}
      </Box>

      <Dialog open={showConfirmDialog} onClose={cancelPhaseChange}>
        <DialogTitle>Estás en fase de mano. ¿Quieres cambiar a fase de ataque?</DialogTitle>
        
        <DialogActions>
          <Button onClick={cancelPhaseChange}>Cancelar</Button>
          <Button variant="contained" onClick={confirmPhaseChange} color="primary">
            Cambiar y seleccionar atacante
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default PlayerTable;
