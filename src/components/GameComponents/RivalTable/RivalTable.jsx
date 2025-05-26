import { Box, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { useState, useEffect } from 'react';

import './RivalTable.css';

function RivalTable({ 
  cartas, turn, battles, targetSpellCard, targetEquipmentCard, isSelectingTargetForSpell, 
  isSelectingTargetForEquipment, mana, onCardClick, onPlayCard }) {

  const [hiddenCards, setHiddenCards] = useState([]); 
  const [removedCards, setRemovedCards] = useState([]);
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingEquipTarget, setPendingEquipTarget] = useState(null);
  const [pendingCardData, setPendingCardData] = useState(null);

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

  const confirmEquipOnRival = () => {
    onPlayCard({ ...pendingCardData, targetId: pendingEquipTarget });
    setConfirmDialogOpen(false);
    setPendingCardData(null);
    setPendingEquipTarget(null);
  };

  const cancelEquipOnRival = () => {
    setConfirmDialogOpen(false);
    setPendingCardData(null);
    setPendingEquipTarget(null);
  };

  return (
    <>
      <Box className="rival-table-container">
        {cartas.map((carta, index) => {
          if (removedCards.includes(carta.id)) return null;

          const cardClass = ` ${carta.position === 'attack' ? 'attack-position' : ''}`;
          const isInRivalBattle = battles.some(b => b.atacanteId === carta.id);
          const isFadingOut = hiddenCards.includes(carta.id);

          return (
            <div
              key={carta.id}
              className={`rival-card-wrapper ${isFadingOut ? 'rival-card-fade-out' : ''}`}
            >
              <div className={`rival-card-table`}>
                <Paper
                  className={`${cardClass} ${isInRivalBattle ? 'rival-card-in-battle' : hoveredCardId === carta.id ? 'hovered' : ''}`}
                  elevation={10}
                  onClick={() => {
                    if (isSelectingTargetForSpell && targetSpellCard) {
                      targetSpellCard(carta.id);
                      return;
                    }
                    if (isSelectingTargetForEquipment && targetEquipmentCard) {
                      if (turn.whose === 'user' && turn.phase === 'hand') {
                        if (window.confirm("¿Estás seguro de que quieres equipar una carta del rival?")) {
                        targetEquipmentCard(carta.id);
                        }
                        return;
                      }
                    }
                    if ((turn.whose === 'rival' && turn.phase === 'attack') && onCardClick) {
                      onCardClick(carta);
                    }
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnter={() => setHoveredCardId(carta.id)}
                  onDragLeave={() => setHoveredCardId(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setHoveredCardId(null);

                    const data = JSON.parse(e.dataTransfer.getData('application/json'));
                    // revisar
                    if ((data.type !== 'spell' && data.type !== 'equipement')) {
                      alert(`no puedes lanzar una criatura sobre una carta rival!!`);
                      return;
                    }

                    if (data.type === 'equipement') {
                      setPendingCardData(data);
                      setPendingEquipTarget(carta.id);
                      setConfirmDialogOpen(true);
                      return;
                    }

                    const cardToSend = {
                      id: data.id,
                      type: data.type,
                      targetId: carta.id
                    };

                    onPlayCard(cardToSend);
                  }}
                >
                  <img
                    src={carta.image}
                    alt={`Carta ${index + 1}`}
                    className="rival-card-image"
                  />

                  {carta.equipements?.length > 0 && (
                    <>
                      <div className="rival-equipment-count">{carta.equipements.length}</div>
                      <div className="rival-equipment-preview">
                        {carta.equipements.map((equipo) => (
                          <img
                            key={equipo.id}
                            src={equipo.image}
                            alt={equipo.id}
                            className="rival-equipment-image"
                          />
                        ))}
                      </div>
                    </>
                  )}
                </Paper>
              </div>
            </div>
          );
        })}
      </Box>

      <Dialog open={confirmDialogOpen} onClose={cancelEquipOnRival}>
        <DialogTitle>¿Equipar carta rival?</DialogTitle>
        <DialogContent>
          ¿Estás seguro de que quieres lanzar un equipamiento sobre una carta rival?
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelEquipOnRival}>Cancelar</Button>
          <Button onClick={confirmEquipOnRival} color="primary" variant="contained">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default RivalTable;
