import React, { useState, useEffect, useMemo, useRef } from "react";
import { Container, Box, Typography } from "@mui/material";
import PlayerProfile from "../../components/GameComponents/PlayerProfile/PlayerProfile";
import RivalProfile from "../../components/GameComponents/RivalProfile/RivalProfile";
import PlayerHand from "../../components/GameComponents/PlayerHand/PlayerHand";
import RivalHand from "../../components/GameComponents/RivalHand/RivalHand";
import RivalTable from "../../components/GameComponents/RivalTable/RivalTable";
import PlayerTable from "../../components/GameComponents/PlayerTable/PlayerTable";
import Announcement from "../../components/GameComponents/Announcement/Announcement";
import TurnIndicator from "../../components/GameComponents/TurnIndicator/TurnIndicator";
import { useLocation } from "react-router-dom";

import "./Game.css";
// import useLoadMatch from "../../services/LoadMatch/LoadMatch";
import {
  playCard,
  switchPhase,
  endTurn,
  addCardToBattle,
  defense,
  resetBattle,
  getBattle,
  onSurrender,
} from "../../services/Actions/GameActions";

function Game() {
  const location = useLocation();
  const partida = location.state?.partida;

  const [gameData, setGameData] = useState(partida);

  console.log("iniciando partida", gameData);

 

  const announcementMode = useMemo(() => {
    if (!gameData) return null;

    if (gameData.action === "welcome") {
      return "vs";
    }
    if (
      gameData.user?.health === 0 ||
      gameData.rival?.health === 0 ||
      gameData.action === "finish"
    ) {
      if (gameData.user?.health > 0) return "victory";
      if (gameData.rival?.health > 0) return "defeat";

      return "daw";
    }

    return null;
  }, [gameData]);

  // const phaseTurn = gameData?.turn?.phase;
  // const whoseTurn = gameData?.turn?.whose;

  const [battles, setBattles] = useState([]);
  const [selectedTableCardIdForEquipment, setSelectedTableCardIdForEquipment] =
    useState(null);
  const [selectedTableCardIdforSpell, setSelectedTableCardIdforSpell] =
    useState(null);
  const [pendingEquipementCard, setPendingEquipementCard] = useState(null);
  const [pendingSpellCard, setPendingSpellCard] = useState(null);
  const [attackers, setAttackers] = useState([]);
  console.log(attackers);
  const [pendingCard, setPendingCard] = useState(null);
  const [playedCard, setPlayedCard] = useState(null);

  const [showAnnouncement, setShowAnnouncement] = useState(false);

  const [draggingType, setDraggingType] = useState(null);

  const [floatingMessage, setFloatingMessage] = useState("");
  const [isFading, setIsFading] = useState(false);

  const [showUsedCard, setShowUsedCard] = useState(false);

  const [battleResultAttackPlayer, setBattleResultAttackPlayer] = useState([]);




  const [enemyUsedQueue, setEnemyUsedQueue] = useState([]);
  const [currentEnemyCard, setCurrentEnemyCard] = useState(null);

const prevUsedCardsRef = useRef(null);

const [highlightedCardId, setHighlightedCardId] = useState(null);

useEffect(() => {
  const used = gameData?.usedCards;
  if (!used) return;

  const isSameReference = used === prevUsedCardsRef.current;
  if (isSameReference) return;

  prevUsedCardsRef.current = used;

  if (Array.isArray(used)) {
    const spellsOrEquips = used.filter(
      (card) => card.type !== "creature" && card.front_image
    );
    if (spellsOrEquips.length > 0) {
      setCurrentEnemyCard(null);
      setEnemyUsedQueue(spellsOrEquips);
    }
  } else if (used.type !== "creature" && used.front_image) {
    setShowUsedCard(true);
    const timer = setTimeout(() => setShowUsedCard(false), 2500);
    return () => clearTimeout(timer);
  }
}, [gameData?.usedCards]);



useEffect(() => {
  if (enemyUsedQueue.length > 0 && !currentEnemyCard) {
    const [next, ...rest] = enemyUsedQueue;
    setCurrentEnemyCard(next);
    setEnemyUsedQueue(rest);

    const timer = setTimeout(() => {
      setCurrentEnemyCard(null);
    }, 2500);

    return () => clearTimeout(timer);
  }
}, [enemyUsedQueue, currentEnemyCard]);






useEffect(() => {
  if (Array.isArray(gameData?.usedCards)) {
    if (currentEnemyCard?.target) {
      setHighlightedCardId(currentEnemyCard.target);
    }
  } else if (gameData?.usedCards?.target) {
    setHighlightedCardId(gameData.usedCards.target);
  }

  const timer = setTimeout(() => {
    setHighlightedCardId(null);
  }, 2600);

  return () => clearTimeout(timer);
}, [currentEnemyCard, gameData?.usedCards]);


  console.log("target-----------------------", highlightedCardId);

  console.log("carta jugada con exito: ", playedCard);

  // useEffect(() => {
  //   if (gameData?.usedCards?.target) {
  //     const delay = setTimeout(() => {
  //       setHighlightBg(true);

  //       setTimeout(() => {
  //         setHighlightBg(false);
  //       }, 1000); // 1 segundo de fondo amarillo
  //     }, 1500); // Esperar 1.5 segundos tras la carta

  //     return () => clearTimeout(delay);
  //   }
  // }, [gameData]);

  useEffect(() => {
    if (floatingMessage) {
      setIsFading(false);
      const fadeTimer = setTimeout(() => setIsFading(true), 2500);
      const removeTimer = setTimeout(() => setFloatingMessage(""), 3000);
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [floatingMessage]);
  

  const handleRivalCardClick = (card) => {
    if (card.position !== "attack") {
      alert("la carta no puede entrar en batalla");
      return;
    }
    const addedBattle = addCardToBattle(card);
    if (addedBattle) updateBattles();
  };

  const handlePlayerCardClick = (card) => {
    if (card.position !== "defense") {
      alert("la carta no puede entrar en batalla");
      return;
    }
    const addedBattle = addCardToBattle(card);
    if (addedBattle) updateBattles();
  };

  const handlePlayCard = (card) => {
    if (card.type === "equipement" && !card.targetId) {
      setPendingEquipementCard(card);
      return;
    }
    if (card.type === "spell" && !card.targetId) {
      setPendingSpellCard(card);
      return;
    }

    if (card.type === "creature" && gameData.user.table.length >= 5) {
      setFloatingMessage("Ya tienes 5 criaturas en mesa");
      return;
    }

    playCard(setGameData, gameData, card);
  };

  const handleSwitchPhase = () => switchPhase(setGameData, gameData);
  const handleEndTurn = async (selectedAttackCards) =>
    await endTurn(
      selectedAttackCards,
      setGameData,
      gameData,
      setFloatingMessage
    );
  const handleDefense = async () => {
    try {
      await defense(setGameData, gameData);
      resetBattle();
      setBattles([]);
    } catch (error) {
      console.error("Error al ejecutar defense:", error);
    }
  };

  const rivalAttackers = gameData.rival.table.some(
    (carta) => carta.position === "attack"
  );

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
  const result = gameData?.battle_result;
  console.log("🧪 battle_result recibido:", result);

  if (Array.isArray(result) && result.length > 0) {
    setBattleResultAttackPlayer(result);

    const timer = setTimeout(() => {
      setBattleResultAttackPlayer([]);
    }, 2000);

    return () => clearTimeout(timer);
  }
}, [gameData?.battle_result]);


  useEffect(() => {
    if (announcementMode) {
      setShowAnnouncement(true);
      console.log("buscame2", gameData.forEnd)
      if (announcementMode === "vs") {
        const timeout = setTimeout(() => {
          setGameData((prev) => ({ ...prev, action: null }));
        }, 3000);
        return () => clearTimeout(timeout);
      }
    }
  }, [announcementMode]);

  useEffect(() => {
    if (pendingEquipementCard && selectedTableCardIdForEquipment) {
      playCard(setGameData, gameData, {
        ...pendingEquipementCard,
        targetId: selectedTableCardIdForEquipment,
      });
      setPendingEquipementCard(null);
      setSelectedTableCardIdForEquipment(null);
    }
  }, [pendingEquipementCard, selectedTableCardIdForEquipment]);

  useEffect(() => {
    if (pendingSpellCard && selectedTableCardIdforSpell) {
      playCard(setGameData, gameData, {
        ...pendingSpellCard,
        targetId: selectedTableCardIdforSpell,
      });
      setPendingSpellCard(null);
      setSelectedTableCardIdforSpell(null);
    }
  }, [pendingSpellCard, selectedTableCardIdforSpell, setGameData]);

  useEffect(() => {
    if (!gameData || !gameData.rival) return;
    const nuevasCartas = gameData.rival.table.filter(
      (carta) => carta.position === "attack"
    );
    if (nuevasCartas.length > 0) {
      setAttackers(nuevasCartas);
    }
  }, [gameData]);

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
      await onSurrender(gameData, setGameData);
    } catch (error) {
      console.error("No se pudo rendir", error);
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
  return (
    <div
  className="app-container"
  style={{ "--background-url": `url(${gameData.backgroundImage})` }}
>

      {/* ${highlightBg ? "highlight-bg" : ""} */}
      <RivalProfile
        className="rival-profile"
        name={gameData.rival.rivalDisplayName || "Rival"}
        imageUrl={
          gameData.rival.rivalAvatar ||
          "https://m.media-amazon.com/images/I/51hPfLUZE0L._AC_UL1002_.jpg"
        }
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
          highlightedCardId={highlightedCardId}
          battleResultAttackPlayer={battleResultAttackPlayer}
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
          rivalAttackers={rivalAttackers}
          highlightedCardId={highlightedCardId}
          battleResultAttackPlayer={battleResultAttackPlayer}
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
        name={gameData.user.playerDisplayName || "Player"}
        imageUrl={
          gameData.user.playerAvatar ||
          "https://img.freepik.com/fotos-premium/angel-cara-angel-alas_901383-148607.jpg"
        }
        life={gameData.user.health}
        mana={gameData.user.mana}
        deck={gameData.user.pending_deck}
        onSurrender={handleSurrenderClick}
      />

      <TurnIndicator turn={gameData.turn} />

       
      {showAnnouncement && (
        <Announcement
          data={gameData}
          duration={3000}
          mode={announcementMode}
          onFinish={() => {
            if (announcementMode === "vs") setShowAnnouncement(false);
          }}
          {...(gameData.forEnd && { forEnd: gameData.forEnd })}
        />
      )}

      {showUsedCard && (
        <img
          src={gameData.usedCards.front_image}
          alt={gameData.usedCards.name}
          className="spell-animation"
        />
      )}
      {currentEnemyCard && (
        <img
          src={currentEnemyCard.front_image}
          alt={currentEnemyCard.name}
          className="spell-animation"
        />
      )}
      {floatingMessage && (
        <div className={`floating-overlay ${isFading ? "fade-out" : ""}`}>
          <div className="floating-message">{floatingMessage}</div>
        </div>
      )}
      {playedCard && (
        <div className="jugada-overlay">
          <img
            src={playedCard.front_image}
            alt={playedCard.name}
            className="jugada-carta"
          />
        </div>
      )}
    </div>
  );
}

export default Game;
