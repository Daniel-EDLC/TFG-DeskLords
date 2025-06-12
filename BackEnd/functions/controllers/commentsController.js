const Comment = require('../models/Comments');
const Player = require('../models/Player');
const Avatar = require('../models/Avatars');

async function createComment(req, res) {
    try {
        if (!req.body.playerId || !req.body.content) return req.response.error('Faltan datos necesarios para crear el comentario');

        const player = await Player.findOne({ uid: req.body.playerId });
        if (!player) return req.response.error('Jugador no encontrado');

        const playerActualAvatar = player.selected_avatar;
        const avatar = await Avatar.findOne({ _id: playerActualAvatar });

        const newComment = new Comment({
            author: player.displayName,
            content: req.body.content,
            playerAvatar: avatar ? avatar.url : '',
        });

        const commentSaved = await newComment.save();

        req.response.success({ comment: commentSaved });
    } catch (error) {
        req.response.error(`Error al crear el comentario: ${error.message}`);
        return;
    }
}

async function getComments(req, res) {
    try {
        const comments = await Comment.find();
        req.response.success({ comments: comments });
    } catch (error) {
        req.response.error(`Error al obtener los comentarios: ${error.message}`);
    }
}

async function getCommentsLimited(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // Filtro opcional por autor
    const filter = {};
    if (req.query.author) {
        filter.author = req.query.author;
    }

    try {
        const total = await Comment.countDocuments(filter);
        const comments = await Comment.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const hasMore = skip + comments.length < total;

        req.response.success({ 
            comments: comments,
            hasMore: hasMore,
            total: total,
            page: page
        });
    } catch (error) {
        req.response.error(`Error al obtener los comentarios: ${error.message}`);
    }
}

async function updateComment(req, res) {
    try {
        const commentId = req.body.idComment;
        const updatedData = req.body.data;

        const updatedComment = await Comment.findByIdAndUpdate(commentId, updatedData, { new: true });

        if (!updatedComment) {
            return req.response.error('Comentario no encontrado');
        }

        req.response.success({ comment: updatedComment });
    } catch (error) {
        req.response.error(`Error al actualizar el comentario: ${error.message}`);
    }
}

async function deleteComment(req, res) {
    try {
        const commentId = req.body.idComment;

        const deletedComment = await Comment.findByIdAndDelete(commentId);

        if (!deletedComment) {
            return req.response.error('Comentario no encontrado');
        }

        req.response.success({ message: 'Comentario eliminado correctamente' });
    } catch (error) {
        req.response.error(`Error al eliminar el comentario: ${error.message}`);
    }
}

module.exports = {
    createComment,
    getComments,
    updateComment,
    deleteComment,
    getCommentsLimited
};