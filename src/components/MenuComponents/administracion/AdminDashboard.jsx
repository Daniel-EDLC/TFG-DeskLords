import { useState } from 'react';
import CardsList from './card';
import AbilitiesList from './ability';
import DecksList from './deck';
import MapsList from './map';
import PlayersList from './player';
import SetsList from './set';
import GamesList from './game';
import CommentsList from './comments';
//css
import './admin.css';

function AdminDashboard() {
  const [view, setView] = useState('cards');

  return (
    <div>
      <h1>Panel de Administración</h1>

      <div>
        <button onClick={() => setView('cards')}>Cartas</button>
        <button onClick={() => setView('abilities')}>Habilidades</button>
        <button onClick={() => setView('decks')}>Decks</button>
        <button onClick={() => setView('maps')}>Mapas</button>
        <button onClick={() => setView('players')}>Jugadores</button>
        <button onClick={() => setView('sets')}>Sets</button>
        <button onClick={() => setView('games')}>Games</button>
        <button onClick={() => setView('comments')}>Comments</button>
      </div>

      {view == 'cards' && <CardsList />}
      {view == 'abilities' && <AbilitiesList />}
      {view == 'decks' && <DecksList />}
      {view == 'maps' && <MapsList />}
      {view == 'players' && <PlayersList />}
      {view == 'sets' && <SetsList />}
      {view == 'games' && <GamesList />}
      {view == 'comments' && <CommentsList />}
    </div>
  );
}

export default AdminDashboard;
