const Map = require('../models/Map');
const { Types } = require('mongoose');
const Deck = require('../models/Deck');

async function createMap(req, res) {
    try {

        const ObjectId = Types.ObjectId;
        const deckId = new ObjectId(req.body.deckId); // Asegúrate de que el ID del mazo sea un ObjectId válido
        
        const deck = await Deck.findById(deckId);
        if (!deck) {
            return req.response.error('El mazo especificado no existe');
        }

        const newMap = new Map({
            name: req.body.name,
            description: req.body.description,
            image: req.body.image,
            deck: deck,
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