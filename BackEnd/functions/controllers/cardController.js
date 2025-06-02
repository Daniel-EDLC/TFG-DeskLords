const Card = require('../models/Card');

async function createCard(req, res) {
    try {
        const newCard = new Card({
            name: req.body.name,
            type: req.body.type,
            element: req.body.element,
            description: req.body.description,
            cost: req.body.manaCost,
            atk: req.body.atk,
            hp: req.body.hp
        });

        const cardSaved = await newCard.save();

        // Usando tu formato de respuesta estándar
        req.response.success({ card: cardSaved });
    } catch (error) {
        req.response.error(`Error al crear la carta: ${error.message}`);
    }
}

async function getCards(req, res) {
    try {
        const cards = await Card.find();
        req.response.success({ cards: cards });
    } catch (error) {
        req.response.error(`Error al obtener las cartas: ${error.message}`);
    }
}

async function updateCard(req, res) {
    try {
        const cardId = req.body.idCard;
        const updatedData = req.body.data;

        const updatedCard = await Card.findByIdAndUpdate(cardId, updatedData, { new: true });

        if (!updatedCard) {
            return req.response.error('Carta no encontrada');
        }

        req.response.success({ card: updatedCard });
    } catch (error) {
        req.response.error(`Error al actualizar la carta: ${error.message}`);
    }
}

async function deleteCard(req, res) {
    try {
        const cardId = req.body.idCard;

        const deletedCard = await Card.findByIdAndDelete(cardId);

        if (!deletedCard) {
            return req.response.error('Carta no encontrada');
        }

        req.response.success({ message: 'Carta eliminada correctamente' });
    } catch (error) {
        req.response.error(`Error al eliminar la carta: ${error.message}`);
    }
}

module.exports = {
    createCard,
    getCards,
    updateCard,
    deleteCard
};