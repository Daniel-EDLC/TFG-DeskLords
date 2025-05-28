const mongoose = require('mongoose');

const connectDB = async (req, res, next) => {
    try {
      if (mongoose.connection.readyState === 0) {
        // 0 = disconnected
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Conectado a MongoDB Atlas desde middleware');
      } else if (mongoose.connection.readyState === 1) {
        // 1 = connected
        console.log('MongoDB ya está conectado');
      } else {
        // 2 = connecting, 3 = disconnecting
        console.warn('Esperando a que la conexión MongoDB se estabilice...');
      }
  
      next();
    } catch (err) {
      console.error('Error al conectar a MongoDB:', err);
      res.status(500).json({ error: 'Error al conectar a MongoDB' });
    }
  };

module.exports = connectDB;