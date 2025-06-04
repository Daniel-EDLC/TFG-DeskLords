const Avatars = require('../models/Avatars');

async function getAvatars(req, res) {
    try {
        const avatars = await Avatars.find();
        return req.response.success({ avatars });
    } catch (error) {
        return req.response.error(`Error recogiendo avatares: ${error.message}`);
    }
}

async function createAvatar(req, res) {
    try {
        
        if (!url || !belongsTo) {
            return req.response.error('Faltan datos obligatorios');
        }

        const newAvatar = new Avatars({
            url: req.body.url,
            belongsTo: req.body.belongsTo,
            price: req.body.price || 0,
            name: req.body.name || 'Avatar sin nombre'
        });

        await newAvatar.save();
        return req.response.success({ avatar: newAvatar });
    } catch (error) {
        return req.response.error(`Error creando avatar: ${error.message}`);
    }
}

async function updateAvatar(req, res) {
    try {
        const avatarId = req.params.idAvatar;
        const updatedData = req.body.data;

        const updatedAvatar = await Avatars.findByIdAndUpdate(avatarId, updatedData, { new: true });
        
        if (!updatedAvatar) {
            return req.response.error('Avatar no encontrado');
        }

        return req.response.success({ avatar: updatedAvatar });
    } catch (error) {
        return req.response.error(`Error actualizando avatar: ${error.message}`);
    }
}

async function deleteAvatar(req, res) {
    try {
        const avatarId = req.params.idAvatar;
        const deletedAvatar = await Avatars.findByIdAndDelete(avatarId);
        
        if (!deletedAvatar) {
            return req.response.error('Avatar no encontrado');
        }

        return req.response.success({ message: 'Avatar eliminado correctamente' });
    } catch (error) {
        return req.response.error(`Error eliminando avatar: ${error.message}`);
    }
}

module.exports = {
    getAvatars,
    createAvatar,
    updateAvatar,
    deleteAvatar
};