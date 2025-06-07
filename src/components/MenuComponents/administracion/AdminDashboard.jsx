import { useState } from 'react';
import CardsList from './card';
import AbilitiesList from './ability';
import DecksList from './deck';
import MapsList from './map';
import PlayersList from './player';
import SetsList from './set';
import GamesList from './game';
//css
import './admin.css';

function AdminDashboard() {
  const [view, setView] = useState('cards');

  return (
    <div className="admin-dashboard-wrapper">
      <div className="admin-toolbar-fixed">
        <h1>Panel de Administración</h1>
        <div className="admin-buttons">
          <button onClick={() => setView('cards')}>Cartas</button>
          <button onClick={() => setView('abilities')}>Habilidades</button>
          <button onClick={() => setView('decks')}>Decks</button>
          <button onClick={() => setView('maps')}>Mapas</button>
          <button onClick={() => setView('players')}>Jugadores</button>
          <button onClick={() => setView('sets')}>Sets</button>
          <button onClick={() => setView('games')}>Games</button>
        </div>
      </div>

      <div className="admin-content-scroll">
        {view === 'cards' && <CardsList />}
        {view === 'abilities' && <AbilitiesList />}
        {view === 'decks' && <DecksList />}
        {view === 'maps' && <MapsList />}
        {view === 'players' && <PlayersList />}
        {view === 'sets' && <SetsList />}
        {view === 'games' && <GamesList />}
      </div>
    </div>
  );
}

export default AdminDashboard;
