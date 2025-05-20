import React, { useState } from 'react';
import { Box, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { endTurn } from '../../../services/Actions/GameActions';
import './PlayerTable.css';

function PlayerTable({ cartas, phase, onRequestPhaseChange, switchPhase, handleAttack, handleDefense, targetEquipmentCard, isSelectingTargetForEquipment,  onCardClick }) {

  const [selectedAttackCards, setselectedAttackCards] = useState([]);
  const [pendingCardId, setPendingCardId] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  

  const handleCardClick = (carta) => {

    switch (phase) {
      case 'hand':
        if (isSelectingTargetForEquipment && targetEquipmentCard) {
            targetEquipmentCard(carta.id);
            return;
        }
        setPendingCardId(carta.id);
        setShowConfirmDialog(true);
        break;

      case 'table':
        toggleAttackCard(carta.id);
        break;

      case 'defense':
        console.log('Defender con carta:', carta);
        onCardClick(carta)
        break;

      default:
        break;
    }
  };


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




  return (
    <>
      <Box className="phase-buttons">
        {(() => {
          switch (phase) {
            case 'hand':
              return (
                <>
                  <Button
                    variant="contained"
                    className="phase-button"
                    onClick={switchPhase}
                  >
                    Fase mesa
                  </Button>
                  <Button
                    variant="contained"
                    className="end-turn-button"
                    onClick={endTurn}
                  >
                    Pasar turno
                  </Button>
                </>
              );

            case 'table':
              return (
                <>
                  {selectedAttackCards.length > 0 ? (
                    <Button
                      variant="contained"
                      className="phase-button"
                      color="primary"
                      onClick={handleAttackClick}
                    >
                      Atacar y finalizar
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      className="end-turn-button"
                      onClick={endTurn}
                    >
                      Finalizar
                    </Button>
                  )}
                </>
              );

            case 'defense':
              return (
                <>
                  {(
                    <Button
                      variant="contained"
                      className="phase-button"
                      color="primary"
                      onClick={handleDefenseClick}
                    >
                      Defender y empezar turno
                    </Button>
                  ) 
                  // : (
                  //   <Button
                  //     variant="contained"
                  //     className="end-turn-button"
                  //     onClick={endTurn}
                  //   >
                  //     Pasar sin defender
                  //   </Button>
                  // )
                  }
                  
                </>
              );

            default:
              return null;
          }
        })()}
      </Box>


      <Box className="player-table-container">

          {cartas.map((carta, index) => {
          const isSelected = selectedAttackCards.includes(carta.id);


          
          // const cardClass = `player-card-table ${carta.battle ? 'player-battle' : ''}`;
          const cardClass = `player-card-table`;

          return (
            <div key={carta.id} className="player-card-wrapper">
              <Paper
                elevation={10}
                className={`${cardClass} ${isSelected ? 'selected' : ''}`}
                onClick={() => handleCardClick(carta)}>
                <img
                  src={carta.image}
                  alt={`Carta ${index + 1}`}
                  className="player-card-img"
                />

                {isSelected && (
                  <div className="attack-label"></div>
                )}

              </Paper>
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
