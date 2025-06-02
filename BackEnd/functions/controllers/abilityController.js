const Ability = require('../models/Ability');

async function createAbility(req, res) {
    try {
        const newAbility = new Ability({
            name: req.body.name,
            description: req.body.description,
        });

        const abilitySaved = await newAbility.save();

        req.response.success({ ability: abilitySaved });
    } catch (error) {
        req.response.error(`Error al crear la habilidad: ${error.message}`);
    }
}

async function getAbilities(req, res) {
    try {
        const abilities = await Ability.find();
        req.response.success({ abilities: abilities });
    } catch (error) {
        req.response.error(`Error al obtener las habilidades: ${error.message}`);
    }
}

async function updateAbility(req, res) {
    try {
        const abilityId = req.body.idAbility;
        const updatedData = req.body.data;

        const updatedAbility = await Ability.findByIdAndUpdate(abilityId, updatedData, { new: true });

        if (!updatedAbility) {
            return req.response.error('Habilidad no encontrada');
        }

        req.response.success({ ability: updatedAbility });
    } catch (error) {
        req.response.error(`Error al actualizar la habilidad: ${error.message}`);
    }
}

async function deleteAbility(req, res) {
    try {
        const abilityId = req.body.idAbility;

        const deletedAbility = await Ability.findByIdAndDelete(abilityId);

        if (!deletedAbility) {
            return req.response.error('Habilidad no encontrada');
        }

        req.response.success({ message: 'Habilidad eliminada correctamente' });
    } catch (error) {
        req.response.error(`Error al eliminar la habilidad: ${error.message}`);
    }
}

module.exports = { createAbility, getAbilities, updateAbility, deleteAbility };