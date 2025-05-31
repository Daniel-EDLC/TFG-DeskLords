const Map = require('../models/Map');
const Deck = require('../models/Deck');

async function createMap(req, res) {
    try {
        const deckId = req.body.deckId;
        
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

async function getMaps(req, res) {
    try {
        const maps = await Map.find().populate('deck');
        req.response.success({ maps: maps });
    } catch (error) {
        req.response.error(`Error al obtener los mapas: ${error.message}`);
    }
}

async function updateMap(req, res) {
    try {
        const mapId = req.body.idMap;
        const updatedData = req.body.data;

        const updatedMap = await Map.findByIdAndUpdate(mapId, updatedData, { new: true });
        if (!updatedMap) {
            return req.response.error('Mapa no encontrado');
        }
        req.response.success({ map: updatedMap });
    } catch (error) {
        req.response.error(`Error al actualizar el mapa: ${error.message}`);
    }
}

async function deleteMap(req, res) {
    try {
        const mapId = req.body.idMap;

        const deletedMap = await Map.findByIdAndDelete(mapId);
        if (!deletedMap) {
            return req.response.error('Mapa no encontrado');
        }

        req.response.success({ message: 'Mapa eliminado correctamente' });
    } catch (error) {
        req.response.error(`Error al eliminar el mapa: ${error.message}`);
    }
}

module.exports = {
    createMap,
    getMaps,
    updateMap,
    deleteMap
};