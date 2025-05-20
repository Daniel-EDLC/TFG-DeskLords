import React from 'react';
import './maps.css';

const Maps = ({ mapas }) => {
  return (
    <div className="maps-wrapper">
      <h2>Selecciona un Mapa</h2>
      <div className="maps-grid">
        {mapas.map((mapa, index) => (
          <div key={index} className="mapa-card">
            {mapa.nombre}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Maps;
