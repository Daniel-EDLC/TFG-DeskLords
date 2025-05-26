const Card = require('../models/Card');

async function createCard(req, res) {
    try {
        const newCard = new Card({
            name: req.body.name,
            type: req.body.type,
            element: req.body.element,
            description: req.body.description,
            cost: req.body.manaCost,
            atk: req.body.attack,
            def: req.body.defense
        });

        const cardSaved = await newCard.save();

        // Usando tu formato de respuesta estándar
        req.response.success({ card: cardSaved });
    } catch (error) {
        req.response.error(`Error al crear la carta: ${error.message}`);
    }
}

module.exports = {
    createCard,
};