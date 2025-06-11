import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import "./RivalTable.css";

function RivalTable({
  cartas,
  turn,
  battles,
  targetSpellCard,
  targetEquipmentCard,
  isSelectingTargetForSpell,
  isSelectingTargetForEquipment,
  onCardClick,
  onPlayCard,
  draggingType,
  pendingCard,
  setPendingCard,
  highlightedCardId,
  battleResultAttackPlayer
}) {
  const [hiddenCards, setHiddenCards] = useState([]);
  const [removedCards, setRemovedCards] = useState([]);
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingEquipTarget, setPendingEquipTarget] = useState(null);
  const [pendingCardData, setPendingCardData] = useState(null);
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
          if (removedCards.includes(carta._id)) return null;

          const cardClass =
            turn.whose === "rival" &&
            turn.phase === "attack" &&
            carta.position === "attack"
              ? "attack-position"
              : "";

          const isInPlayerBattle = battles.some(
            (b) => b.atacanteId === carta._id
          );
          const isInRivalBattle = battleResultAttackPlayer.some(
            (b) => b.attacker === carta._id || b.defender === carta._id
          );
          const isFadingOut = hiddenCards.includes(carta._id);

          return (
            <div
              key={carta._id}
              className={`rival-card-wrapper ${
                isFadingOut ? "rival-card-fade-out" : ""
              }`}
            >
              <div className={`rival-card-table`}>
                <Paper
                  className={`${cardClass} 
                  ${
                    isInPlayerBattle
                      ? "rival-card-in-battle"
                      : hoveredCardId === carta._id
                      ? "hovered"
                      : ""
                  } 
                  ${isInRivalBattle ? "player-card-in-battle" : ""}
                  ${longPressCardId === carta._id ? "rival-long-pressed" : ""} 
                  ${carta.new ? "rival-card-new" : ""}
                  ${
                    draggingType === "spell" || draggingType === "equipement"
                      ? "rival-drop-hover"
                      : ""
                  }
                  ${
                    ["spell", "equipement"].includes(pendingCard?.type)
                      ? "rival-drop-hover"
                      : ""
                  }
                  ${carta._id === highlightedCardId?._id ? "rival-highlighted" : ""}
                `}
                  elevation={10}
                  onClick={() => {
                    if (
                      pendingCard &&
                      (pendingCard.type === "spell" ||
                        pendingCard.type === "equipement") &&
                      turn.whose === "user" &&
                      turn.phase === "hand"
                    ) {
                      onPlayCard({
                        _id: pendingCard.id,
                        type: pendingCard.type,
                        cost: pendingCard.cost,
                        targetId: carta._id,
                      });

                      setPendingCard(null);
                      return;
                    }

                    if (isSelectingTargetForSpell && targetSpellCard) {
                      if (turn.whose === "user" && turn.phase === "hand") {
                        targetSpellCard(carta._id);
                      } else {
                        alert(
                          "Solo puedes lanzar hechizos durante tu fase de mano."
                        );
                      }
                      return;
                    }

                    if (isSelectingTargetForEquipment && targetEquipmentCard) {
                      if (turn.whose === "user" && turn.phase === "hand") {
                        if (
                          window.confirm(
                            "¿Estás seguro de que quieres equipar una carta del rival?"
                          )
                        ) {
                          targetEquipmentCard(carta._id);
                        }
                      } else {
                        alert(
                          "Solo puedes lanzar equipamientos durante tu fase de mano."
                        );
                      }
                      return;
                    }

                    if (
                      turn.whose === "rival" &&
                      turn.phase === "attack" &&
                      onCardClick
                    ) {
                      onCardClick(carta);
                    }
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnter={() => setHoveredCardId(carta._id)}
                  onDragLeave={() => setHoveredCardId(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setHoveredCardId(null);

                    const data = JSON.parse(
                      e.dataTransfer.getData("application/json")
                    );

                    if (turn.whose !== "user" || turn.phase !== "hand") {
                      alert(
                        "Solo puedes lanzar cartas durante tu fase de mano"
                      );
                      return;
                    }

                    if (data.type === "creature") {
                      alert(
                        "No puedes lanzar una criatura sobre una carta rival"
                      );
                      return;
                    }

                    if (data.type === "equipement") {
                      // setPendingCardData(data);
                      // setPendingEquipTarget(carta._id);
                      // setConfirmDialogOpen(true);
                      onPlayCard({
                        _id: data.id,
                        type: data.type,
                        cost: data.cost,
                        targetId: carta._id,
                      });

                      setPendingCard(null);
                      return;
                    }

                    if (data.type === "spell") {
                      onPlayCard({
                        _id: data.id,
                        type: data.type,
                        cost: data.cost,
                        targetId: carta._id,
                      });
                      setPendingCard(null);
                      return;
                    }
                  }}
                  onTouchStart={() => {
                    const timeoutId = setTimeout(() => {
                      setLongPressCardId(carta._id);
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
                  <img
                    src={carta.front_image}
                    alt={`Carta ${index + 1}`}
                    className="rival-card-image"
                  />
                  {typeof carta.atk === "number" &&
                    typeof carta.hp === "number" && (
                      <div className="rival-card-center-stats">
                        <div className="atk">
                          {carta.atk}
                          {/* {carta.atk + (carta.equipements?.reduce((sum, eq) => sum + (eq.atk || 0), 0) || 0)} */}
                        </div>
                        <div className="blnc">/</div>
                        <div className="hp">
                          {carta.hp}
                          {/* {carta.hp + (carta.equipements?.reduce((sum, eq) => sum + (eq.hp || 0), 0) || 0)} */}
                        </div>
                      </div>
                    )}
                  {(carta.abilities?.length > 0 ||
                    carta.temporaryAbilities?.length > 0) && (
                    <div className="rival-ability-tags">
                      {carta.abilities?.map((h, i) => (
                        <div key={`perm-${i}`} className="rival-ability-tag">
                          {h}
                        </div>
                      ))}
                      {carta.temporaryAbilities?.map((h, i) => (
                        <div key={`temp-${i}`} className="rival-ability-tag temp">
                          {h}
                        </div>
                      ))}
                    </div>
                  )}
                  {carta.equipements?.length > 0 && (
                    <>
                      <div className="rival-equipment-count">
                        {carta.equipements.length}
                      </div>
                      <div className="rival-equipment-preview">
                        {carta.equipements.map((equipo) => (
                          <div
                            key={equipo._id}
                            className="rival-equipment-wrapper"
                          >
                            <img
                              src={equipo.front_image}
                              alt={equipo._id}
                              className={`rival-equipment-image ${
                                equipo.new ? "rival-card-new" : ""
                              }`}
                            />
                            {(typeof equipo.atk === "number" ||
                              typeof equipo.hp === "number") && (
                              <div className="rival-equipment-bonus-overlay">
                                +{equipo.atk || 0} / +{equipo.hp || 0}
                              </div>
                            )}
                          </div>
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
          ¿Estás seguro de que quieres lanzar un equipamiento sobre una carta
          rival?
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelEquipOnRival}>Cancelar</Button>
          <Button
            onClick={confirmEquipOnRival}
            color="primary"
            variant="contained"
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default RivalTable;
