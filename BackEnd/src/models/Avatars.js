const mongoose = require('mongoose');

const avatarsSchema = new mongoose.Schema({
  url: { type: String, required: true },
  belongsTo: { type: String, enum: ['store', 'battlepass', 'event'], required: true },
  price: { type: Number, required: false }, // solo si está en tienda
  name: { type: String, required: false },  // útil para el frontend
});

const Avatars = mongoose.model('Avatars', avatarsSchema);

module.exports = Avatars;