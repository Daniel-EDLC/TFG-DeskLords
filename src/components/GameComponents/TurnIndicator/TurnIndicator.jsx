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
          <span className="info-label">{isPlayerTurn ? "Player" : "Rival"}</span>
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
  className="info-dialog "
  maxWidth="sm"
  fullWidth
  PaperProps={{
    className: "custom-dialog",
  }}
>
  {/* <DialogTitle>GUIA</DialogTitle> */}
  <DialogContent className="dialog-content">
    <p>
      <h3>Criaturas</h3>
      Tienen fuerza, resistencia y habilidades (permanentes o temporales).
      <br />
      <h3>Hechizos</h3>
      Ofrecen un efecto extra sobre una criatura durante un turno o asesina una criatura.
      <br />
      <h3>Equipamientos</h3>
      Ofrecen un efecto extra sobre una criatura o aumenta su fuerza / resistencia (de manera permanente).
      <br />
      <h3>Funciones</h3>
      Puedes jugar cualquier carta clicando en ella y despues sobre el objetivo o arrastrándola a la mesa o a su objetivo.
      <br />
      <h3>Habilidades</h3>
      <span className="keyword">Volar</span> Puede atacar sin ser bloqueada por criaturas sin volar.
      <br />
      <span className="keyword">Fuerza bruta</span> al atacar, el daño restante a la resistencia del bloqueador pasara como daño al usuario.
      <br />
      <span className="keyword">Toque mortal</span> cualquier daño que inflija a una criatura es suficiente para destruirla.
      <br />
      <span className="keyword">Invulnerabilidad</span> no puede ser destruida por daño de criatura.
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
