import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  useMediaQuery,
} from "@mui/material";

import "./PlayerTable.css";

function PlayerTable({
  cartas,
  turn,
  handleSwitchPhase,
  handleEndTurn,
  handleDefense,
  targetEquipmentCard,
  targetSpellCard,
  isSelectingTargetForEquipment,
  isSelectingTargetForSpell,
  onCardClick,
  battles,
  onResetBattle,
  mana,
  onPlayCard,
  draggingType,
  pendingCard,
  setPendingCard,
  rivalAttackers,
  highlightedCardId
}) {



  const [selectedAttackCards, setselectedAttackCards] = useState([]);
  const [pendingCardId, setPendingCardId] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [hiddenCards, setHiddenCards] = useState([]);
  const [removedCards, setRemovedCards] = useState([]);
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const [longPressCardId, setLongPressCardId] = useState(null);
  const [longPressTimeout, setLongPressTimeout] = useState(null);
  const aliveDef = cartas.some((carta) => carta.alive === true);
  const isMobile = useMediaQuery("(max-width:435px)");

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
    if (turn.whose === "user" && turn.phase === "hand") {
      // ✅ 1. Si tienes una carta pendiente para lanzar (por clic previo)
      if (
        pendingCard &&
        (pendingCard.type === "spell" || pendingCard.type === "equipement")
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
      return;
    }

    if (turn.whose === "user" && turn.phase === "table") {
      toggleAttackCard(carta._id);
      return;
    }

    if (turn.whose === "rival" && turn.phase === "attack") {
      onCardClick(carta);
      return;
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
      console.error("Error al atacar:", error);
    }
  };

  const handleDefenseClick = async () => {
    try {
      await handleDefense();
      setselectedAttackCards([]);
    } catch (error) {
      console.error("Error al defender:", error);
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
          if (turn.whose === "user") {
            switch (turn.phase) {
              case "hand":
                return (
                  <Box className="phase-buttons-inner">
                    {cartas.length > 0 && (
                      <Button
                        variant="contained"
                        className="phase-button"
                        onClick={handleSwitchPhase}
                      >
                        {" "}
                        {isMobile ? "Mesa" : "Fase Mesa"}{" "}
                      </Button>
                    )}
                    <Button
                      variant="contained"
                      className="end-turn-button"
                      onClick={handleEndTurnClick}
                    >
                      {" "}
                      {isMobile ? "Pasar" : "Pasar turno"}{" "}
                    </Button>
                  </Box>
                );

              case "table":
                return (
                  <Box className="phase-buttons-inner">
                    {selectedAttackCards.length > 0 ? (
                      <Button
                        variant="contained"
                        className="phase-button"
                        onClick={handleEndTurnClick}
                      >
                        {isMobile ? "Atacar" : "Atacar y finalizar"}
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        className="end-turn-button"
                        onClick={handleEndTurnClick}
                      >
                        Finalizar
                      </Button>
                    )}
                  </Box>
                );
              default:
                return null;
            }
          } else if (turn.whose === "rival" && turn.phase === "attack") {
            return (
              <Box className="phase-buttons-inner">
                {battles.length > 0 ? (
                  <>
                    <Button
                      variant="contained"
                      className="resetBattle-button"
                      onClick={onResetBattle}
                    >
                      {isMobile ? "Reiniciar" : "Reiniciar batallas"}
                    </Button>

                    <Button
                      variant="contained"
                      className="phase-button"
                      onClick={handleDefenseClick}
                    >
                      {isMobile ? "Defender" : "Defender y empezar turno"}
                    </Button>
                  </>
                ) : rivalAttackers && aliveDef ? (
                  <Button
                    variant="contained"
                    className="phase-button"
                    onClick={handleDefenseClick}
                  >
                    {isMobile ? "No defender" : "Empezar turno sin defender"}
                  </Button>
                ) : null}
              </Box>
            );
          }
        })()}
      </Box>
      <Box
        className={`player-table-container ${
          draggingType === "creature" ? "player-drop-hover" : ""
        }`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const raw = e.dataTransfer.getData("application/json");
          if (!raw) return;

          const data = JSON.parse(raw);

          if (turn.whose !== "user" || turn.phase !== "hand") {
            alert("Solo puedes jugar cartas durante tu fase de mano");
            return;
          }

          if (data.type !== "creature") {
            alert("Solo puedes soltar criaturas en la mesa.");
            return;
          }

          if (data.cost > mana) {
            alert(`Mana insuficiente! Coste: ${data.cost}, Tienes: ${mana}`);
            return;
          }

          onPlayCard({
            _id: data.id,
            type: "creature",
            cost: data.cost,
          });
        }}
      >
        {cartas.map((carta, index) => {
          if (removedCards.includes(carta._id)) return null;
          const isSelected = selectedAttackCards.includes(carta._id);
          const isInPlayerBattle = battles.some(
            (b) => b.defensorId === carta._id
          );
          const isFadingOut = hiddenCards.includes(carta._id);
          return (
            <div
              key={carta._id}
              className={`player-card-wrapper ${
                isFadingOut ? "player-card-fade-out" : ""
              } `}
            >
              <div
                className={`player-card-table 
                ${isSelected ? "selected" : ""} 
                ${isInPlayerBattle ? "player-card-in-battle" : ""}
                `}
              >
                {/* ${selectedAttackCards.includes(carta._id) ? 'attack-animating' : ''} */}
                <Paper
                  elevation={10}
                  className={`player-card-inner 
                    ${hoveredCardId === carta._id ? "hovered" : ""} 
                    ${
                      longPressCardId === carta._id ? "player-long-pressed" : ""
                    } 
                    ${carta.new ? "player-card-new" : ""} 
                    ${isSelected ? "selected" : ""}
                    ${
                      draggingType === "spell" || draggingType === "equipement"
                        ? "player-drop-hover"
                        : ""
                    }
                    ${
                      ["spell", "equipement"].includes(pendingCard?.type)
                        ? "player-drop-hover"
                        : ""
                    }
                    ${carta._id === highlightedCardId?._id ? "player-highlighted" : ""}
                    `}
                  onClick={() => handleCardClick(carta)}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnter={() => setHoveredCardId(carta._id)}
                  onDragLeave={() => setHoveredCardId(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    const raw = e.dataTransfer.getData("application/json");
                    if (!raw) return;

                    const data = JSON.parse(raw);

                    if (turn.whose !== "user" || turn.phase !== "hand") {
                      alert("Solo puedes usar cartas durante tu fase de mano");
                      return;
                    }

                    if (data.type === "creature") {
                      alert("No puedes lanzar criaturas sobre otras cartas.");
                      return;
                    }

                    if (data.cost > mana) {
                      alert(
                        `Mana insuficiente! Coste: ${data.cost}, Tienes: ${mana}`
                      );
                      return;
                    }

                    onPlayCard({
                      _id: data.id,
                      type: data.type,
                      cost: data.cost,
                      targetId: carta._id,
                    });
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
                    className="player-card-image"
                  />

                  {typeof carta.atk === "number" &&
                    typeof carta.hp === "number" && (
                      <div className="player-card-center-stats">
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
                    <div className="player-ability-tags">
                      {carta.abilities?.map((h, i) => (
                        <div key={`perm-${i}`} className="ability-tag">
                          {h}
                        </div>
                      ))}
                      {carta.temporaryAbilities?.map((h, i) => (
                        <div key={`temp-${i}`} className="ability-tag temp">
                          {h}
                        </div>
                      ))}
                    </div>
                  )}
                  {carta.equipements?.length > 0 && (
                    <>
                      <div className="player-equipment-count">
                        {carta.equipements.length}
                      </div>
                      <div className="player-equipment-preview">
                        {carta.equipements.map((equipo) => (
                          <div
                            key={equipo._id}
                            className="player-equipment-wrapper"
                          >
                            <img
                              src={equipo.front_image}
                              alt={equipo._id}
                              className={`player-equipment-image ${
                                equipo.new ? "player-card-new" : ""
                              }`}
                            />
                            {(typeof equipo.atk === "number" ||
                              typeof equipo.hp === "number") && (
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
        <DialogTitle>
          Estás en fase de mano. ¿Quieres cambiar a fase de ataque?
        </DialogTitle>
        <DialogActions>
          <Button onClick={cancelPhaseChange}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={confirmPhaseChange}
                        className="phase-button"
          >
            Cambiar y seleccionar atacante
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default PlayerTable;
