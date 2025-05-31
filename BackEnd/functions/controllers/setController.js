const Set = require('../models/Set');

async function createSet(req, res) {
    try {
        const newSet = new Set({
            name: req.body.name,
            description: req.body.description,
            release_date: req.body.release_date
        });

        const setSaved = await newSet.save();

        // Usando tu formato de respuesta estándar
        req.response.success({ set: setSaved });
    } catch (error) {
        req.response.error(`Error al crear el set: ${error.message}`);
    }
}

async function getSets(req, res) {
    try {
        const sets = await Set.find();
        req.response.success({ sets: sets });
    } catch (error) {
        req.response.error(`Error al obtener los sets: ${error.message}`);
    }
}

async function updateSet(req, res) {
    try {
        const setId = req.body.idSet;
        const updatedData = req.body.data;

        const updatedSet = await Set.findByIdAndUpdate(setId, updatedData, { new: true });
        if (!updatedSet) {
            return req.response.error('Set no encontrado');
        }
        req.response.success({ set: updatedSet });
    } catch (error) {
        req.response.error(`Error al actualizar el set: ${error.message}`);
    }
}

async function deleteSet(req, res) {
    try {
        const setId = req.body.idSet;

        const deletedSet = await Set.findByIdAndDelete(setId);
        if (!deletedSet) {
            return req.response.error('Set no encontrado');
        }

        req.response.success({ message: 'Set eliminado correctamente' });
    } catch (error) {
        req.response.error(`Error al eliminar el set: ${error.message}`);
    }
}

module.exports = {
    createSet,
    getSets,
    updateSet,
    deleteSet
};