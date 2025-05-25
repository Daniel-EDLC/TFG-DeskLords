const Deck = require('../models/Deck');

async function createDeck(req, res) {
    try {
        const newDeck = new Deck({
            name: req.body.name,
            description: req.body.description,
            image: req.body.image,
            cards: req.body.cards
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