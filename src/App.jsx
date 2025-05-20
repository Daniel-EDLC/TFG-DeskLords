import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Game from './Pages/Game/Game';
import Menu from './Pages/Menu/Menu';
import { cargaInformacion } from '../src/services/Actions/MenuActions';
import './App.css';

const App = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      const resultado = await cargaInformacion();
      setData(resultado);
    };
    cargar();
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/game" element={<Game />} />
        <Route path="/menu" element={<Menu data={data} />} />
        <Route path="*" element={<Navigate to="/menu" replace />} />
      </Routes>
    </Router>
  );
};

export default App;

