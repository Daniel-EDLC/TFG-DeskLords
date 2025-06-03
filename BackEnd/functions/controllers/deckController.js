const Deck = require('../models/Deck');
const Card = require('../models/Card');

async function createDeck(req, res) {

    let deckCards = [];

    for (const cardId of req.body.cards) {

        const cardFound = await Card.findById(cardId);

        if (!cardFound) {
            return req.response.error(`Carta no encontrada: ${cardId}`);
        }

        deckCards.push(cardFound);
    }

    try {
        const newDeck = new Deck({
            name: req.body.name,
            description: req.body.description,
            image: req.body.image,
            cards: deckCards
        });

        const deckSaved = await newDeck.save();

        // Usando tu formato de respuesta estándar
        req.response.success({ deck: deckSaved });
    } catch (error) {
        req.response.error(`Error al crear el mazo: ${error.message}`);
    }
}

async function getDecks(req, res) {
    try {
        const decks = await Deck.find().populate('cards');
        req.response.success({ decks: decks });
    } catch (error) {
        req.response.error(`Error al obtener los mazos: ${error.message}`);
    }
}

async function updateDeck(req, res) {
    try {
        const deckId = req.body.idDeck;
        const updatedData = req.body.data;

        const updatedDeck = await Deck.findByIdAndUpdate(deckId, updatedData, { new: true });

        if (!updatedDeck) {
            return req.response.error('Mazo no encontrado');
        }

        req.response.success({ deck: updatedDeck });
    } catch (error) {
        req.response.error(`Error al actualizar el mazo: ${error.message}`);
    }
}

async function deleteDeck(req, res) {
    try {
        const deckId = req.body.idDeck;

        const deletedDeck = await Deck.findByIdAndDelete(deckId);

        if (!deletedDeck) {
            return req.response.error('Mazo no encontrado');
        }

        req.response.success({ message: 'Mazo eliminado correctamente' });
    } catch (error) {
        req.response.error(`Error al eliminar el mazo: ${error.message}`);
    }
}

module.exports = {
    createDeck,
    getDecks,
    updateDeck,
    deleteDeck
};