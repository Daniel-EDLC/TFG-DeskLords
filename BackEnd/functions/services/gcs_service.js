const path = require('path');
const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
    keyFilename: path.join(__dirname, '../config/firebase-credentials.json'),
    projectId: process.env.GCS_PROJECT_ID,
});

const bucketName = process.env.GCS_BUCKET;
const bucket = storage.bucket(bucketName);

const uploadFileToGCS = (file, type) => {
    console.log(`Uploading file: ${file.originalname} of type: ${type}`);
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
            console.log(`Blob name: ${blob.name}`);
            const blobStream = blob.createWriteStream({
                resumable: false,
                contentType: file.mimetype
            });

            console.log(`Starting upload for: ${blob.name}`);

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