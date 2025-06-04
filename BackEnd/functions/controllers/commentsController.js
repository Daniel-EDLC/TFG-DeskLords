const Comment = require('../models/Comments');

async function createComment(req, res) {
    try {
        const newComment = new Comment({
            author: req.body.author,
            title: req.body.title,
            content: req.body.content,
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
    deleteComment
};