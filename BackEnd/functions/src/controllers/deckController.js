const Deck = require('../models/Deck');
const Card = require('../models/Card');
const { Types } = require('mongoose');

async function createDeck(req, res) {

    let deckCards = [];
    const ObjectId = Types.ObjectId;
    for (const cardId of req.body.cards) {
        const cardObjectId = new ObjectId(cardId);
        if (!ObjectId.isValid(cardObjectId)) {
            return req.response.error(`ID de carta inválido: ${cardId}`);
        }
        const cardFound = await Card.findById(cardObjectId);
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

module.exports = {
    createDeck,
};