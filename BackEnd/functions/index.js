const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const app = require("./src/app");
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
    region: "us-central1",
}, app);