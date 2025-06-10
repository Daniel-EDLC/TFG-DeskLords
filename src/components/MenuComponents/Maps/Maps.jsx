import React, { useState, useEffect } from 'react';
import './maps.css';

const Maps = ({ mapas, onSelect }) => {
  const [selectedMap, setSelectedMap] = useState(null);
useEffect(() => {
    if (!selectedMap && mapas.length > 0) {
      const firstAvailable = mapas.find((m) => m.available);
      if (firstAvailable) {
        setSelectedMap(firstAvailable);
        onSelect(firstAvailable);
      }
    }
  }, [mapas, selectedMap, onSelect]);


  const handleSelect = (mapa) => {
    if (mapa.available) {
      setSelectedMap(mapa);
      onSelect(mapa); 
    }
  };

  return (
  <div
  className="maps-wrapper"
  style={
    window.innerWidth <= 435 && selectedMap?.image
      ? { '--mapa-image-url': `url(${selectedMap.image})` }
      : {}
  }
>

  <h2>Selecciona un Mapa</h2>
  <div className="maps-content">
    <div className="maps-grid">
      {mapas.map((mapa, index) => (
        <div
          key={index}
          className={`mapa-card ${!mapa.available ? 'disabled' : ''}`}
          onClick={() => handleSelect(mapa)}
        >
          {mapa.name}
        </div>
      ))}
    </div>

    {selectedMap && (
      <div className="mapa-preview-wrapper">
        <img src={selectedMap.image} alt={selectedMap.name} className="mapa-preview-image" />
      </div>
    )}
  </div>
</div>

  );
};

export default Maps;
