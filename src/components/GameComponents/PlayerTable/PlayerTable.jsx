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

  useEffect(() => {
    cartas.forEach((carta) => {
      if (carta.alive === false && !hiddenCards.includes(carta._id)) {
        setTimeout(() => {
          setHiddenCards((prev) => [...prev, carta._id]);
        }, 3000);
      }
    });
  }, [cartas]);

  useEffect(() => {
    cartas.forEach((carta) => {
      if (carta.alive === false && !removedCards.includes(carta._id)) {
        setTimeout(() => {
          setRemovedCards((prev) => [...prev, carta._id]);
        }, 4000);
      }
    });
  }, [cartas]);

  const handleCardClick = (carta) => {
    if (turn.whose === 'user') {
      if (turn.phase === 'hand') {
        if (isSelectingTargetForEquipment && targetEquipmentCard) {
          targetEquipmentCard(carta._id);
          setPendingCardId(null);
          setShowConfirmDialog(false);
          return;
        }

        if (isSelectingTargetForSpell && targetSpellCard) {
          targetSpellCard(carta._id);
          setPendingCardId(null);
          setShowConfirmDialog(false);
          return;
        }

        setPendingCardId(carta._id);
        setShowConfirmDialog(true);

      } else if (turn.phase === 'table') {
        toggleAttackCard(carta._id);
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
    if (handleSwitchPhase) {
      handleSwitchPhase(); // Cambio real de fase
    }
    setShowConfirmDialog(false);
    if (pendingCardId !== null) {
      toggleAttackCard(pendingCardId); // Ya que quería atacar
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
          if (turn.whose === 'user') {
            switch (turn.phase) {
              case 'hand':
                return (
                  <Box className="phase-buttons-inner">
                    <Button variant="contained" className="phase-button" onClick={handleSwitchPhase}>Fase mesa</Button>
                    <Button variant="contained" className="end-turn-button" onClick={handleEndTurnClick}>Pasar turno</Button>
                  </Box>
                );
              case 'table':
                return (
                  <Box className="phase-buttons-inner">
                    {selectedAttackCards.length > 0 ? (
                      <Button variant="contained" className="phase-button" color="primary" onClick={handleEndTurnClick}>Atacar y finalizar</Button>
                    ) : (
                      <Button variant="contained" className="end-turn-button" onClick={handleEndTurnClick}>Finalizar</Button>
                    )}
                  </Box>
                );
              default:
                return null;
            }
          } else if (turn.whose === 'rival' && turn.phase === 'attack') {
            return (
              <Box className="phase-buttons-inner">
                {battles.length > 0 ? (
                  <>
                    <Button variant="contained" className="resetBattle-button" color="primary" onClick={onResetBattle}>Reiniciar batallas</Button>
                    <Button variant="contained" className="phase-button" color="primary" onClick={handleDefenseClick}>Defender y empezar turno</Button>
                  </>
                ) : (
                  <Button variant="contained" className="noDefense-button" color="primary" onClick={handleDefenseClick}>Empezar turno sin defender</Button>
                )}
              </Box>
            );
          }
        })()}
      </Box>
      <Box className="player-table-container">
        {cartas.map((carta, index) => {
          if (removedCards.includes(carta._id)) return null;

          const isSelected = selectedAttackCards.includes(carta._id);
          const isInPlayerBattle = battles.some(b => b.defensorId === carta._id);
          const isFadingOut = hiddenCards.includes(carta._id);

          return (
            <div key={carta._id} className={`player-card-wrapper ${isFadingOut ? 'player-card-fade-out' : ''} `}>
              <div className={`player-card-table ${isSelected ? 'selected' : ''} ${isInPlayerBattle ? 'player-card-in-battle' : ''}`}>
                <Paper
                  elevation={10}
                  className={`player-card-inner ${hoveredCardId === carta._id ? 'hovered' : ''} ${longPressCardId === carta._id ? 'player-long-pressed' : ''} ${carta.new ? 'player-card-new' : ''} ${isSelected ? 'selected' : ''} `}
                  onClick={() => handleCardClick(carta)}
                >
                  <img src={carta.front_image} alt={`Carta ${index + 1}`} className="player-card-image" />

                  {typeof carta.atk === 'number' && typeof carta.hp === 'number' && (
                    <div className="player-card-center-stats">
                      <div className="atk">
                        {carta.atk + (carta.equipements?.reduce((sum, eq) => sum + (eq.atk || 0), 0) || 0)}
                      </div>
                      <div className="blnc">/</div>
                      <div className="hp">
                        {carta.hp + (carta.equipements?.reduce((sum, eq) => sum + (eq.hp || 0), 0) || 0)}
                      </div>
                    </div>
                  )}

                  {carta.abilities?.length > 0 && (
                    <div className="player-stats-abilities">
                      <span className="label">Habilidades:</span>
                      <ul>
                        {carta.abilities.map((h, i) => <li key={i}>{h}</li>)}
                      </ul>
                    </div>
                  )}

                  {carta.temporaryAbilities?.length > 0 && (
                    <div className="player-stats-abilities temp">
                      <span className="label">Temporales:</span>
                      <ul>
                        {carta.temporaryAbilities.map((h, i) => <li key={i}>{h}</li>)}
                      </ul>
                    </div>
                  )}

                  {carta.equipements?.length > 0 && (
                    <>  
                      <div className="player-equipment-count">{carta.equipements.length}</div>
                      <div className="player-equipment-preview">
                        {carta.equipements.map((equipo) => (
                          <div key={equipo._id} className="player-equipment-wrapper">
                            <img
                              src={equipo.front_image}
                              alt={equipo._id}
                              className={`player-equipment-image ${equipo.new ? 'player-card-new' : ''}`}
                            />
                            {(typeof equipo.atk === 'number' || typeof equipo.hp === 'number') && (
                              <div className="equipment-bonus">
                                +{equipo.atk || 0} / +{equipo.hp || 0}
                              </div>
                            )}
                          </div>
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
