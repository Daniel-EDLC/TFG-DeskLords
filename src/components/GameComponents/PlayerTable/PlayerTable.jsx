import React, { useState, useEffect } from 'react';
import { Box, Paper, Dialog, DialogTitle, DialogActions, Button } from '@mui/material';
import './PlayerTable.css';

function PlayerTable({ 
  cartas, turn, onRequestPhaseChange, handleSwitchPhase, handleEndTurn, handleDefense, targetEquipmentCard, targetSpellCard, 
  isSelectingTargetForEquipment, isSelectingTargetForSpell,  onCardClick, battles, onResetBattle , mana , onPlayCard }) {

  const [selectedAttackCards, setselectedAttackCards] = useState([]);
  const [pendingCardId, setPendingCardId] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  const [hiddenCards, setHiddenCards] = useState([]);
  const [removedCards, setRemovedCards] = useState([]);
  const [hoveredCardId, setHoveredCardId] = useState(null);

  const [longPressCardId, setLongPressCardId] = useState(null);
  const [longPressTimeout, setLongPressTimeout] = useState(null);

  const handleCardClick = (carta) => {
    if (turn.whose === 'user') {
      if (turn.phase === 'hand') {
        if (isSelectingTargetForEquipment && targetEquipmentCard) {
          targetEquipmentCard(carta.id);
          setPendingCardId(null);
          setShowConfirmDialog(false);
          return;
        }

        if (isSelectingTargetForSpell && targetSpellCard) {
          targetSpellCard(carta.id);
          setPendingCardId(null);
          setShowConfirmDialog(false);
          return;
        }

        setPendingCardId(carta.id);
        setShowConfirmDialog(true);

      } else if (turn.phase === 'table') {
        toggleAttackCard(carta.id);
      }
    } else if (turn.whose === 'rival') {
      if (turn.phase === 'attack') {
        onCardClick(carta);
      }
    }
  };

  const toggleAttackCard = (id) => {
    setselectedAttackCards((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((cardId) => cardId !== id)
        : [...prevSelected, id]
    );
  };

  const handleEndTurnClick = async () => {
    try {
      await handleEndTurn(selectedAttackCards);  
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
        }, 3000);
      }
    });
  }, [cartas]);

  useEffect(() => {
    cartas.forEach((carta) => {
      if (carta.alive === false && !removedCards.includes(carta.id)) {
        setTimeout(() => {
          setRemovedCards((prev) => [...prev, carta.id]);
        }, 4000);
      }
    });
  }, [cartas]);

  const renderPhaseButtons = (turn) => {
    if (turn.whose === 'user'){
      switch (turn.phase) {
        case 'hand':
          return (
             <Box className="phase-buttons-inner">
              <Button variant="contained" className="phase-button" onClick={handleSwitchPhase}>
                Fase mesa
              </Button>
              <Button variant="contained" className="end-turn-button" onClick={handleEndTurnClick}>
                Pasar turno
              </Button>
            </Box>
          );
        case 'table':
          return (
             <Box className="phase-buttons-inner">
              {selectedAttackCards.length > 0 ? (
                <Button variant="contained" className="phase-button" color="primary" onClick={handleEndTurnClick}>
                  Atacar y finalizar
                </Button>
              ) : (
                <Button variant="contained" className="end-turn-button" onClick={handleEndTurnClick}>
                  Finalizar
                </Button>
              )}
            </Box>
          );
        default:
          return null;
      }
    } else if(turn.whose === 'rival' && turn.phase === 'attack' ){
      return (
        <>
          {battles.length > 0 ? (
             <Box className="phase-buttons-inner">
              <Button variant="contained" className="resetBattle-button" color="primary" onClick={onResetBattle}>
                Reiniciar batallas
              </Button>
              <Button variant="contained" className="phase-button" color="primary" onClick={handleDefenseClick}>
                Defender y empezar turno
              </Button>
            </Box>
          ) : (
            <Box className="phase-buttons-inner">
            <Button variant="contained" className="noDefense-button" color="primary" onClick={handleDefenseClick}>
              Empezar turno sin defender
            </Button>
            </Box>
          )}
        </>
      );
    }
  };

  return (
    <>
      <Box className="phase-buttons">
        {renderPhaseButtons(turn)}
      </Box>
      <Box
        className="player-table-container"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const data = JSON.parse(e.dataTransfer.getData('application/json'));
          // revisar
          // if ((data.type !== 'spell' && data.type !== 'equipement')) {
          //   alert(`no puedes lanzar una criatura sobre una carta rival!!`);
          //   return;
          // }
          const cardToSend = {
            id: data.id,
            type: data.type
          };
          onPlayCard(cardToSend);
        }}
      >
        {cartas.map((carta, index) => {
          if (removedCards.includes(carta.id)) return null;

          const isSelected = selectedAttackCards.includes(carta.id);
          const isInPlayerBattle = battles.some(b => b.defensorId === carta.id);
          const isFadingOut = hiddenCards.includes(carta.id);

          return (
            <div key={carta.id} className={`player-card-wrapper ${isFadingOut ? 'player-card-fade-out' : ''}`}>
              <div className={`player-card-table ${isSelected ? 'selected' : ''} ${isInPlayerBattle ? 'player-card-in-battle' : ''}`}>
                <Paper
                  elevation={10}
                  className={`player-card-inner ${hoveredCardId === carta.id ? 'hovered' : ''} ${longPressCardId === carta.id ? 'player-long-pressed' : ''} `}
                  onClick={() => handleCardClick(carta)}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnter={() => setHoveredCardId(carta.id)}
                  onDragLeave={() => setHoveredCardId(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    const data = JSON.parse(e.dataTransfer.getData('application/json'));
                    // revisar
                    // if ((data.type !== 'spell' && data.type !== 'equipement')) {
                    //   alert(`no puedes lanzar una criatura sobre una carta rival!!`);
                    //   return;
                    // }
                    if (data.type === 'equipement' || data.type === 'spell') {
                      const cardToSend = {
                        id: data.id,
                        type: data.type,
                        targetId: carta.id,
                      };
                      onPlayCard(cardToSend);
                      return;
                    }
                    // alert("Solo puedes lanzar hechizos o equipamientos sobre cartas de la mesa.");
                  }}
                  onTouchStart={() => {
                    const timeoutId = setTimeout(() => {
                      setLongPressCardId(carta.id);
                    }, 500);
                    setLongPressTimeout(timeoutId);
                  }}
                  onTouchEnd={() => {
                    clearTimeout(longPressTimeout);
                    setLongPressCardId(null);
                  }}
                  onTouchCancel={() => {
                    clearTimeout(longPressTimeout);
                    setLongPressCardId(null);
                  }}
                >
                  <img src={carta.front_image} alt={`Carta ${index + 1}`} className="player-card-image" />
                  {carta.equipements?.length > 0 && (
                    <>
                      <div className="player-equipment-count">{carta.equipements.length}</div>
                      <div className="player-equipment-preview">
                        {carta.equipements.map((equipo) => (
                          <img
                            key={equipo.id}
                            src={equipo.front_image}
                            alt={equipo.id}
                            className="player-equipment-image"
                          />
                        ))}
                      </div>
                    </>
                  )}
                  {isSelected && <div className="attack-label"></div>}
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
