import React, { useState } from "react";
import "./BattlePass.css";

function BattlePass({ battlePass }) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [recompensaSeleccionada, setRecompensaSeleccionada] = useState(null);

  if (!battlePass) {
    return <div className="battle-pass-container error-battle-pass">Pase de batalla no disponible</div>;
  }

  const { levels, actualLevel } = battlePass;

  const abrirModal = (recompensa) => {
    setRecompensaSeleccionada(recompensa);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setRecompensaSeleccionada(null);
  };

  return (
    <div className="battle-pass-container">
      {levels.map((level, index) => {
        const nivel = index + 1;
        const isCompleted = nivel <= actualLevel;
        const isLast = nivel === levels.length;
        const isMiddle = nivel === Math.ceil(levels.length / 2);

        const recompensa = level.rewards || {};
        const recompensaImg = recompensa.image;
        const recompensaCoins = recompensa.coins;

        return (
          <React.Fragment key={level._id || nivel}>
            <div className="battle-pass-wrapper">
              <div
                className={`battle-pass-node ${isCompleted ? "completed" : ""} ${isLast ? "final" : ""} ${isMiddle ? "middle" : ""}`}
                onClick={() => abrirModal(recompensa)}
              >
                {recompensaImg ? (
                  <div className="node-content">
                    <img src={recompensaImg} alt={`Nivel ${nivel}`} className="node-img" />
                    {recompensaCoins && (
                      <div className="coin-amount">{recompensaCoins}</div>
                    )}
                  </div>
                ) : recompensaCoins ? (
                  <div className="coin-only">{recompensaCoins}</div>
                ) : (
                  <span>{nivel}</span>
                )}
              </div>
            </div>

            {!isLast && (
              <div className={`battle-pass-bar ${nivel < actualLevel ? "completed" : ""}`} />
            )}
          </React.Fragment>
        );
      })}

      {modalAbierto && (
        <div className="custom-modal-overlay" onClick={cerrarModal}>
          <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={cerrarModal}>X</button>
            <h2 className="modal-title">Recompensa</h2>
            <div className="modal-body">
              {recompensaSeleccionada?.image && (
                <img src={recompensaSeleccionada.image} alt="Recompensa" className="modal-image" />
              )}
              {recompensaSeleccionada?.coins && (
                <p className="modal-text">Monedas: {recompensaSeleccionada.coins}</p>
              )}
              {recompensaSeleccionada?.avatarId && (
                <p className="modal-text">Avatar ID: {recompensaSeleccionada.avatarId}</p>
              )}
              {recompensaSeleccionada?.deckId && (
                <p className="modal-text">Mazo desbloqueado: {recompensaSeleccionada.deckId}</p>
              )}
              {!Object.keys(recompensaSeleccionada || {}).length && (
                <p className="modal-text">Sin información de recompensa.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BattlePass;
