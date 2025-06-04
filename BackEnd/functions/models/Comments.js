const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    author: {type: String, required: true},
    title: {type: String, required: true},
    content: {type: String, required: true},
    date: {type: Date, default: Date.now, immutable: true},
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;