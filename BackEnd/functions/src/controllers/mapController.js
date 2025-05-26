const Map = require('../models/Map');
const Deck = require('../models/Deck');
const { Types } = require('mongoose');

async function createMap(req, res) {
    try {
        const ObjectId = Types.ObjectId;
        const deckObjectId = new ObjectId(req.body.deckId);
        const deckFound = await Deck.findById(deckObjectId);

        const newMap = new Map({
            name: req.body.name,
            description: req.body.description,
            image: req.body.image,
            deck: deckFound,
            element: req.body.element
        });

        const mapSaved = await newMap.save();

        // Usando tu formato de respuesta estándar
        req.response.success({ map: mapSaved });
    } catch (error) {
        req.response.error(`Error al crear el mapa: ${error.message}`);
    }
}

module.exports = {
    createMap,
};