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
module.exports = {
    createSet,
};