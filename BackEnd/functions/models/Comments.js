const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    author: {type: String, required: true},
    playerAvatar: {type: String, default: ''},
    content: {type: String, required: true},
}, { timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;