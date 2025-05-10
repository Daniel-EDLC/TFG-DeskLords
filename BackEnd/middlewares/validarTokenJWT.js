// Inicializacion de Firebase
const admin = require("firebase-admin");
const serviceAccount = require("./../firebase-credentials.json");

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const validarTokenJWT = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('Auth token is empty or malformed');
        return res.status(401).json({ error: 'Token no proporcionado o mal formado' });
    }

    const authToken = authHeader.replace('Bearer ', '');

    try {
        const decodedToken = await admin.auth().verifyIdToken(authToken);
        console.log('TOKEN VERIFICADO:', decodedToken);
        req.user = decodedToken; // Se guarda en la request para acceder en rutas
        next();
    } catch (err) {
        console.error('Error al verificar token:', err);
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
};

module.exports = validarTokenJWT;