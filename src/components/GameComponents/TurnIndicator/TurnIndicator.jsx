import React, { useState } from "react";
import PanToolIcon from "@mui/icons-material/PanTool";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import SecurityIcon from "@mui/icons-material/Security";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Button from "@mui/material/Button";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import "./TurnIndicator.css";

export default function TurnIndicator({ turn }) {
  const [openPhase, setOpenPhase] = useState(null);
  const [openInfoDialog, setOpenInfoDialog] = useState(false);


  if (!turn) return null;

  const { phase, whose } = turn;
  const isPlayerTurn = whose === "user";

  const openDialog = (fase) => setOpenPhase(fase);
  const closeDialog = () => setOpenPhase(null);

  const getPhaseInfo = (phase, whose) => {
    const isPlayer = whose === "user";

    const info = {
      hand: {
        title: "Fase de Mano",
        description: isPlayer
          ? "En esta fase puedes lanzar criaturas, hechizos y equipamientos desde tu mano a la mesa."
          : "El rival puede lanzar criaturas, hechizos o equipamientos desde su mano.",
      },
      table: {
        title: "Fase Principal / Ataque",
        description: isPlayer
          ? "Aquí puedes declarar atacantes seleccionando tus criaturas en mesa."
          : "El rival está en su fase de ataque.",
      },
      defense: {
        title: "Fase de Defensa",
        description: isPlayer
          ? "Ahora debes seleccionar tus criaturas para bloquear los ataques rivales."
          : "El rival organiza sus defensas contra tus ataques.",
      },
    };

    return info[phase] || {};
  };

  return (
    <>
      <div className={`turn-indicator ${!isPlayerTurn ? "rival" : "player"}`}>
        <div className={isPlayerTurn ? "info-player" : "info-rival"}>
          {isPlayerTurn ? "Player" : "Rival"}
          <InfoOutlinedIcon className="info-icon" onClick={() => setOpenInfoDialog(true)} />

        </div>

        <div className="icons">
          <div
            className={`icon ${phase === "hand" ? "active" : ""}`}
            onClick={() => openDialog("hand")}
            title="Fase de mano"
          >
            <PanToolIcon fontSize="inherit" />
          </div>
          <div
            className={`icon ${
              phase === "table" || phase === "attack" ? "active" : ""
            }`}
            onClick={() => openDialog("table")}
            title="Fase principal / ataque"
          >
            <MilitaryTechIcon fontSize="inherit" />
          </div>
          <div
            className={`icon ${phase === "defense" ? "active" : ""}`}
            onClick={() => openDialog("defense")}
            title="Fase de defensa"
          >
            <SecurityIcon fontSize="inherit" />
          </div>
        </div>
      </div>

      <Dialog
        open={!!openPhase}
        onClose={closeDialog}
        className="phase-dialog"
        maxWidth="xs"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: "#1e1e1e",
            color: "white",
            borderRadius: "12px",
            padding: "1.5rem",
          },
        }}
      >
        <DialogTitle>{getPhaseInfo(openPhase, turn.whose)?.title}</DialogTitle>
        <DialogContent>
          <p>{getPhaseInfo(openPhase, turn.whose)?.description}</p>
        </DialogContent>
        <Button
          onClick={closeDialog}
          style={{ marginTop: "1rem", backgroundColor: "#444", color: "white" }}
        >
          Cerrar
        </Button>
      </Dialog>


<Dialog
  open={openInfoDialog}
  onClose={() => setOpenInfoDialog(false)}
  className="info-dialog"
  maxWidth="sm"
  fullWidth
  PaperProps={{
    className: "custom-dialog",
  }}
>
  <DialogTitle>GUIA</DialogTitle>
  <DialogContent className="dialog-content">
    <p>
      <h3>Criaturas</h3>
      Tienen fuerza, resistencia y habilidades (permanentes o temporales).
      <br />
      Se juega dandole "click" o arrastrando a la mesa.
      <br />
      <h3>Hechizos</h3>
      Se pueden lanzar sobre cartas (objetivo) usando clic o arrastre.
      <br />
      Se juegan dando "click" primero al hechizo y despues al objetivo o arrastrando al objetivo directamente.
      <br />
      <h3>Equipamientos</h3>
      Se asignan a cartas en mesa como objetivo.
      <br />
      Se juegan dando "click" primero al equipamiento y despues a la carta objetivo o arrastrando al objetivo directamente.
      <br />
      <h3>Dale click a los iconos de fase para saber mas sobre ellas</h3>
    </p>
  </DialogContent>
  <Button
    onClick={() => setOpenInfoDialog(false)}
    className="dialog-close-button"
  >
    Cerrar
  </Button>
</Dialog>

    </>
  );
}
