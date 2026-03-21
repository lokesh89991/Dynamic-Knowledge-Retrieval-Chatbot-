import express from 'express';
import multer from 'multer';
import os from 'os';
import { addDocument, getDocuments, askQuestion, uploadFile } from '../controllers/ragController.js';

const router = express.Router();
const upload = multer({ dest: os.tmpdir() });

router.post('/add-doc', addDocument);
router.post('/upload-file', upload.single('file'), uploadFile);
router.get('/docs', getDocuments);
router.post('/ask', askQuestion);

export default router;
