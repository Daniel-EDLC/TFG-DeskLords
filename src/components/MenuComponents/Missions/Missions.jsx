import React from "react";
import "./Missions.css";

function Missions({ misiones }) {
  if (!misiones || misiones.length === 0) {
    return <p className="missions-empty">No tienes misiones / pases de batalla activos.</p>;
  }

  return (
    <div className="missions-container">
      <h2>Misiones Diarias</h2>
      <ul className="missions-list">
        {misiones.map((mision) => (
          <li key={mision._id} className="mission-item">
            <h3>{mision.title}</h3>
            <p>{mision.description}</p>
            <span className="mission-reward">Recompensa: {mision.reward} 🪙</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Missions;
