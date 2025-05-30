import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './Pages/Auth/Auth';
import Menu from './Pages/Menu/Menu';
import Game from './Pages/Game/Game';
import './App.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route path="/game" element={<Game />} />
        <Route path="/menu" element={<Menu />} /> {/* ya no le pasas `data` */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
