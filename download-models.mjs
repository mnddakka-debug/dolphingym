import fs from 'fs';
import https from 'https';
import path from 'path';

const MODELS_DIR = path.join(process.cwd(), 'public', 'models');

if (!fs.existsSync(MODELS_DIR)) {
    fs.mkdirSync(MODELS_DIR, { recursive: true });
}

const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

const files = [
    'tiny_face_detector_model-weights_manifest.json',
    'tiny_face_detector_model-shard1',
];

async function downloadModel() {
    for (const file of files) {
        const filePath = path.join(MODELS_DIR, file);
        if (fs.existsSync(filePath)) {
            console.log(`Skipping ${file}, already exists`);
            continue;
        }
        console.log(`Downloading ${file}...`);
        await new Promise((resolve, reject) => {
            https.get(`${baseUrl}/${file}`, (res) => {
                const fileStream = fs.createWriteStream(filePath);
                res.pipe(fileStream);
                fileStream.on('finish', () => {
                    fileStream.close();
                    console.log(`Downloaded ${file}`);
                    resolve();
                });
            }).on('error', (err) => {
                fs.unlink(filePath, () => { });
                console.error(`Error downloading ${file}:`, err.message);
                reject(err);
            });
        });
    }
}

downloadModel().then(() => console.log('Done downloading models'));
