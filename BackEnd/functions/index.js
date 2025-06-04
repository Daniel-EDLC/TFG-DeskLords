const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const app = require("./app");
const path = require("path");

// Configuración de Firebase Admin con credenciales (usando functions:config)
const credentialsPath = process.env.APPLICATION_CREDENTIALS;
const serviceAccount = require(path.resolve(__dirname, credentialsPath));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Exportar tu app de Express como una función HTTPS
exports.api = onRequest({
    cors: true,
    timeoutSeconds: 60,
    memory: "512MiB",
    maxInstances: 10,
    allowUnauthenticated: true,
    region: "europe-west1",
    enviromentVariables: {
        MONGODB_URI: process.env.MONGODB_URI,
        APPLICATION_CREDENTIALS: process.env.APPLICATION_CREDENTIALS,
    }
}, app);