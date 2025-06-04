import React from "react";
import "./BattlePass.css";

function BattlePass({ nivelActual = 0, recompensas = {} }) {
  const totalNiveles = 10;

  return (
    <div className="battle-pass-container">
      {[...Array(totalNiveles)].map((_, i) => {
        const nivel = i + 1;
        const isCompleted = nivel <= nivelActual;
        const isLast = nivel === totalNiveles;
        const isMiddle = nivel === Math.ceil(totalNiveles / 2);
        const recompensaImg = recompensas[nivel];

        return (
          <React.Fragment key={nivel}>
            <div className="battle-pass-wrapper">
              <div
                className={`battle-pass-node ${isCompleted ? "completed" : ""} ${isLast ? "final" : ""} ${isMiddle ? "middle" : ""}`}
              >
                {nivel}
              </div>
              {recompensaImg && (
                <div className="reward-preview">
                  <img src={recompensaImg} alt={`Nivel ${nivel}`} />
                </div>
              )}
            </div>

            {!isLast && (
              <div className={`battle-pass-bar ${nivel < nivelActual ? "completed" : ""}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default BattlePass;
