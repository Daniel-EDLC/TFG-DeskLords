import { useEffect, useState } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../../firebaseConfig"


function CardsList() {
    const [cards, setCards] = useState([]);
    const [abilitiesList, setAbilitiesList] = useState([]);
    const [setsList, setSetsList] = useState([]);
    const [editingCard, setEditingCard] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState(getEmptyForm());


    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        fetchCards();
        fetchAbilities();
        fetchSets();
    }, []);

    function getEmptyForm() {
        return {
            name: '', type: '', description: '', element: '',
            atk: 0, hp: 0, cost: 0, effect: '', set: '',
            front_image: '', back_image: '', abilities: []
        };
    }

    async function fetchCards() {
        const user = await new Promise((resolve, reject) => {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                unsubscribe();
                if (user) resolve(user);
                else reject(new Error("Usuario no autenticado"));
            });
        });

        const userToken = await user.getIdToken();


        try {
            const res = await fetch(`https://api-meafpnv6bq-ew.a.run.app/api/getCards`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${userToken}`
                    }
                }
            );
            const data = await res.json();
            setCards(data.data.cards);
        } catch (error) {
            console.error('Error al obtener cartas:', error);
        }
    }

    async function fetchAbilities() {
        const user = await new Promise((resolve, reject) => {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                unsubscribe();
                if (user) resolve(user);
                else reject(new Error("Usuario no autenticado"));
            });
        });

        const userToken = await user.getIdToken();
        try {
            const res = await fetch(`https://api-meafpnv6bq-ew.a.run.app/api/getAbilities`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${userToken}`
                    }
                }
            );
            const data = await res.json();
            setAbilitiesList(data.data.abilities);
        } catch (error) {
            console.error('Error al obtener habilidades:', error);
        }
    }

    async function fetchSets() {
        const user = await new Promise((resolve, reject) => {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                unsubscribe();
                if (user) resolve(user);
                else reject(new Error("Usuario no autenticado"));
            });
        });

        const userToken = await user.getIdToken();
        try {
            const res = await fetch(`https://api-meafpnv6bq-ew.a.run.app/api/getSets`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${userToken}`
                    }
                }
            );
            const data = await res.json();
            setSetsList(data.data.sets);
        } catch (error) {
            console.error('Error al obtener sets:', error);
        }
    }

    async function deleteCard(id) {
        const user = await new Promise((resolve, reject) => {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                unsubscribe();
                if (user) resolve(user);
                else reject(new Error("Usuario no autenticado"));
            });
        });

        const userToken = await user.getIdToken();

        try {
            const res = await fetch(`https://api-meafpnv6bq-ew.a.run.app/api/deleteCard`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userToken}`
                },
                body: JSON.stringify({ id })
            });
            if (res.ok) {
                setCards(cards.filter(card => card._id !== id));
            }
        } catch (error) {
            console.error('Error al borrar carta:', error);
        }
    }

    async function saveCard(e) {

        const user = await new Promise((resolve, reject) => {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                unsubscribe();
                if (user) resolve(user);
                else reject(new Error("Usuario no autenticado"));
            });
        });

        const userToken = await user.getIdToken();
        e.preventDefault();
        const isEdit = !!editingCard;

        try {
            const url = isEdit
                ? `https://api-meafpnv6bq-ew.a.run.app/api/updateCard`
                : `https://api-meafpnv6bq-ew.a.run.app/api/createCard`;
            const method = isEdit ? 'PUT' : 'POST';

            const payload = isEdit
                ? { idCard: editingCard._id, data: formData }
                : formData;

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userToken}`
                },

                body: JSON.stringify(payload)
            });

            if (res.ok) {
                fetchCards();
                setEditingCard(null);
                setIsCreating(false);
                setFormData(getEmptyForm());
            }
        } catch (error) {
            console.error('Error al guardar carta:', error);
        }
    }

    function openEdit(card) {
        setEditingCard(card);
        setIsCreating(false);
        setFormData({
            name: card.name || '',
            type: card.type || '',
            description: card.description || '',
            element: card.element || '',
            atk: card.atk || 0,
            hp: card.hp || 0,
            cost: card.cost || 0,
            effect: card.effect || '',
            set: card.set || '',
            front_image: card.front_image || '',
            back_image: card.back_image || '',
            abilities: card.abilities || []
        });
    }

    function toggleAbility(value) {
        setFormData(prev => {
            const list = prev.abilities;
            const exists = list.includes(value);
            return {
                ...prev,
                abilities: exists ? list.filter(v => v !== value) : [...list, value]
            };
        });
    }

    return (
        <div>
            <h2>Lista de Cartas</h2>
            <button onClick={() => { setIsCreating(true); setFormData(getEmptyForm()); setEditingCard(null); }}>
                + Nueva Carta
            </button>
            <div className="table-scroll-wrapper">
                <table border="1" cellPadding="8" cellSpacing="0" style={{ marginTop: '10px' }}>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Tipo</th>
                            <th>Elemento</th>
                            <th>ATK</th>
                            <th>HP</th>
                            <th>Coste</th>
                            <th>Set</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cards.map(card => (
                            <tr key={card._id}>
                                <td>{card.name}</td>
                                <td>{card.type}</td>
                                <td>{card.element}</td>
                                <td>{card.atk}</td>
                                <td>{card.hp}</td>
                                <td>{card.cost}</td>
                                <td>{card.set}</td>
                                <td>
                                    <button onClick={() => openEdit(card)}>Editar</button>
                                    <button onClick={() => deleteCard(card._id)}>Borrar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {(editingCard || isCreating) && (
                <div className="modal-overlay">
                    <form onSubmit={saveCard}>
                        <h3>{editingCard ? 'Editar Carta' : 'Nueva Carta'}</h3>

                        <div >
                            <label>name:</label>
                            <input
                                type="text"
                                value={formData.name}
                                pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$"
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                                title="Solo letras y espacios"
                            />
                        </div>

                        <div>
                            <label>type:</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                required
                            >
                                <option value="" disabled>-- Selecciona un tipo --</option>
                                <option value="creature">Criatura</option>
                                <option value="spell">Conjuro</option>
                                <option value="equipement">Equipo</option>
                            </select>
                        </div>

                        <div>
                            <label>description:</label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label>element:</label>
                            <input
                                type="text"
                                value={formData.element}
                                pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$"
                                onChange={e => setFormData({ ...formData, element: e.target.value })}
                                required
                                title="Solo letras y espacios"
                            />
                        </div>

                        {['atk', 'hp', 'manaCost'].map(field => {
                            const inputProps = {
                                required: true,
                                type: 'number',
                                value: formData[field],
                                onChange: e => setFormData({
                                    ...formData,
                                    [field]: parseInt(e.target.value) || 0
                                })
                            };

                            if (field === 'atk') {
                                inputProps.min = 0;
                                inputProps.max = 25;
                            }

                            if (field === 'hp') {
                                inputProps.min = 0;
                            }

                            return (
                                <div key={field}>
                                    <label>{field}:</label>
                                    <input {...inputProps} />
                                </div>
                            );
                        })}

                        <div>
                            <label>set:</label>
                            <select
                                value={formData.set}
                                onChange={e => setFormData({ ...formData, set: e.target.value })}
                                required
                            >
                                <option value="" disabled>-- Selecciona un set --</option>
                                {setsList.map(set => (
                                    <option key={set._id} value={set.name}>{set.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label>effect (opcional):</label>
                            <input
                                type="text"
                                value={formData.effect}
                                onChange={e => setFormData({ ...formData, effect: e.target.value })}
                            />
                        </div>

                        <div>
                            <label>URL de Imagen Frontal (opcional):</label>
                            <input
                                type="text"
                                value={formData.front_image}
                                onChange={e => setFormData({ ...formData, front_image: e.target.value })}
                                placeholder="https://ejemplo.com/imagen.png"
                            />
                            {formData.front_image && (
                                <div style={{ marginTop: '10px' }}>
                                    <img src={formData.front_image} alt="Preview" style={{ maxWidth: '150px', maxHeight: '150px' }} />
                                </div>
                            )}
                        </div>

                        <div>
                            <label>Abilities:</label>
                            {abilitiesList.map(a => (
                                <label key={a._id} style={{ marginRight: '10px' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.abilities.includes(a.name)}
                                        onChange={() => toggleAbility(a.name)}
                                    />
                                    {a.name}
                                </label>
                            ))}
                        </div>

                        <br />
                        <button type="submit">Guardar</button>
                        <button type="button" onClick={() => { setEditingCard(null); setIsCreating(false); }} style={{ marginLeft: '10px' }}>
                            Cancelar
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default CardsList;
