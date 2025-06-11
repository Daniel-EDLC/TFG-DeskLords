import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../../firebaseConfig';

function DecksList() {
  const [decks, setDecks] = useState([]);
  const [deckCards, setDeckCards] = useState([]);
  const [allCards, setAllCards] = useState([]);
  const [sets, setSets] = useState([]);
  const [editingDeck, setEditingDeck] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState(getEmptyForm());

  function getEmptyForm() {
    return {
      name: '',
      description: '',
      image: '',
      cards: [],
      set: ''
    };
  }

  useEffect(() => {
    fetchDecks();
    fetchCards();
    fetchSets();
  }, []);

  async function getUserToken() {
    const user = await new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        if (user) resolve(user);
        else reject(new Error("Usuario no autenticado"));
      });
    });
    return await user.getIdToken();
  }

  async function fetchDecks() {
    try {
      const token = await getUserToken();
      const res = await fetch(`https://api-meafpnv6bq-ew.a.run.app/api/getDecks`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      setDecks(data.data.decks);
    } catch (error) {
      console.error('Error al obtener decks:', error);
    }
  }

  async function fetchCards() {
    try {
      const token = await getUserToken();
      const res = await fetch(`https://api-meafpnv6bq-ew.a.run.app/api/getCards`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      setAllCards(data.data.cards);
    } catch (error) {
      console.error('Error al obtener cartas:', error);
    }
  }

  async function fetchSets() {
    try {
      const token = await getUserToken();
      const res = await fetch(`https://api-meafpnv6bq-ew.a.run.app/api/getSets`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      setSets(data.data.sets);
    } catch (error) {
      console.error('Error al obtener sets:', error);
    }
  }

  async function deleteDeck(id) {
    try {
      const token = await getUserToken();
      const payload = {
        userId: '',
        idDeck: id
      };
      const res = await fetch(`https://api-meafpnv6bq-ew.a.run.app/api/deleteDeck`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setDecks(decks.filter(deck => deck._id !== id));
      }
    } catch (error) {
      console.error('Error al borrar deck:', error);
    }
  }

  async function saveDeck(e) {
    e.preventDefault();
    const isEdit = !!editingDeck;

    try {
      const token = await getUserToken();

      const url = isEdit
        ? `https://api-meafpnv6bq-ew.a.run.app/api/updateDeck`
        : `https://api-meafpnv6bq-ew.a.run.app/api/createDeck`;

      const method = isEdit ? 'PUT' : 'POST';

      const fullCards = isEdit
        ? formData.cards.map(cardId => {
            const found = allCards.find(card => card._id === cardId);
            return found || { _id: cardId };
          })
        : formData.cards.map(cardId => String(cardId));

      const payload = isEdit
        ? {
            userId: '',
            idDeck: editingDeck._id,
            data: {
              name: formData.name,
              description: formData.description,
              image: formData.image,
              cards: fullCards,
              set: formData.set
            }
          }
        : {
            name: formData.name,
            description: formData.description,
            image: formData.image,
            cards: fullCards,
            set: formData.set
          };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await fetchDecks();
        setEditingDeck(null);
        setIsCreating(false);
        setFormData(getEmptyForm());
      } else {
        const errorText = await res.text();
        console.error('Respuesta error:', errorText);
      }
    } catch (error) {
      console.error('Error al guardar deck:', error);
    }
  }

  function openEdit(deck) {
    setEditingDeck(deck);
    setIsCreating(false);
    setFormData({
      name: deck.name || '',
      description: deck.description || '',
      image: deck.image || '',
      cards: deck.cards?.map(c => typeof c === 'string' ? c : c._id) || [],
      set: deck.set || ''
    });
  }

  function toggleCard(cardId) {
    setFormData(prev => {
      const exists = prev.cards.includes(cardId);
      if (!exists && prev.cards.length >= 15) {
        alert('No se pueden seleccionar más de 15 cartas en un deck.');
        return prev;
      }

      return {
        ...prev,
        cards: exists
          ? prev.cards.filter(id => id !== cardId)
          : [...prev.cards, cardId]
      };
    });
  }

  const filteredCards = formData.set
    ? allCards.filter(card => card.set === formData.set)
    : [];

  return (
    <div style={{ padding: '20px' }}>
      <h2>Lista de Decks</h2>
      <button onClick={() => { setIsCreating(true); setFormData(getEmptyForm()); setEditingDeck(null); }}>
        + Nuevo Deck
      </button>
      <div className="table-scroll-wrapper">
      <table border="1" cellPadding="8" cellSpacing="0" style={{ marginTop: '10px' }}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Número Cartas</th>
            <th>Set</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {decks.map(deck => (
            <tr key={deck._id}>
              <td>{deck.name}</td>
              <td>{deck.description || '-'}</td>
              <td>{deck.cards?.length || 0}</td>
              <td>{deck.set || '-'}</td>
              <td>
                <button onClick={() => openEdit(deck)}>Editar</button>
                <button onClick={() => deleteDeck(deck._id)}>Borrar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {(editingDeck || isCreating) && (
        <div className="modal-overlay">
          <form onSubmit={saveDeck}>
            <h3>{editingDeck ? 'Editar Deck' : 'Nuevo Deck'}</h3>

            <label>Nombre:</label>
            <input
              type="text"
              value={formData.name}
              pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$"
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
              title="Solo letras y espacios"
            />

            <label>Descripción (opcional):</label>
            <input
              type="text"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />

            <label>Imagen (opcional):</label>
            <input
              type="text"
              value={formData.image}
              onChange={e => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://ejemplo.com/imagen.png"
            />

            <label>Set:</label>
            <select
              value={formData.set}
              onChange={e => setFormData({ ...formData, set: e.target.value, cards: [] })}
              required
            >
              <option value="" disabled>-- Selecciona un set --</option>
              {sets.map(set => (
                <option key={set._id} value={set.name}>{set.name}</option>
              ))}
            </select>

            <div>
              <label>Cartas:</label>
              <div>
                {filteredCards.map(card => (
                  <label key={card._id}>
                    <input
                      type="checkbox"
                      checked={formData.cards.includes(card._id)}
                      onChange={() => toggleCard(card._id)}
                    />
                    {card.name} ({card.element}, ATK: {card.atk})
                  </label>
                ))}
              </div>
              <p>
                {formData.cards.length}/15 cartas seleccionadas
              </p>
            </div>

            <br />
            <button
              type="submit"
              disabled={formData.cards.length > 15 || formData.cards.length < 1}
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => { setEditingDeck(null); setIsCreating(false); }}
            >
              Cancelar
            </button>
          </form>

        </div>
      )}
    </div>
  );
}

export default DecksList;
