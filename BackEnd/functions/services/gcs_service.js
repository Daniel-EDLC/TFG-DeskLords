// services/gcs.service.js
const path = require('path');
const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
    keyFilename: path.join(__dirname, '../config/firebase_credentials.json'),
});

const bucketName = process.env.GCS_BUCKET; // Replace with your bucket name
const bucket = storage.bucket(bucketName);

const uploadFileToGCS = (file, type) => {
    try {
        return new Promise((resolve, reject) => {
            let folder = '';
            switch (type) {
                case 'avatar': folder = 'Imagenes_Perfil/'; break;
                case 'deck': folder = 'Imagenes_Decks/'; break;
                case 'card': folder = 'Imagenes_Cartas/Frontales/'; break;
                case 'map': folder = 'Imagenes_Mapas/'; break;
                default: folder = ''; break;
            }
            const blob = bucket.file(folder + Date.now() + '_' + file.originalname);
            const blobStream = blob.createWriteStream({
                resumable: false,
                contentType: file.mimetype,
                public: true,
            });

            blobStream.on('error', (err) => reject(err));

            blobStream.on('finish', () => {
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
                resolve(publicUrl);
            });

            blobStream.end(file.buffer);
        });
    } catch (error) {
        return Promise.reject(new Error(`Error uploading file to GCS: ${error.message}`));
    }
};

module.exports = { uploadFileToGCS };