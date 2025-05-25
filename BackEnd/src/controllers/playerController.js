const Player = require('../models/Player');

async function createPlayer(req, res) {
    try {
        const id = new ObjectId(req.body.uid); // Genera un nuevo ObjectId para el jugador

        const newPlayer = new Player({
            _id: id,
            name: req.body.name,
            state: req.body.state
        });

        const playerSaved = await newPlayer.save();

        // Usando tu formato de respuesta estándar
        req.response.success({ user: playerSaved });
    } catch (error) {
        req.response.error(`Error al crear usuario: ${error.message}`);
    }
}

module.exports = {
    createPlayer,
};