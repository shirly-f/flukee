/**
 * Document Upload API
 * Saves files to uploads/ and returns a URL for use in read_document tasks
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, '../uploads');
const ALLOWED_MIME = [
  'application/pdf',
  'application/x-pdf',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'text/plain',
  'text/html',
  'application/octet-stream', // fallback when browser doesn't detect type
];

const ALLOWED_EXT = ['.pdf', '.doc', '.docx', '.txt'];

// Ensure uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.pdf';
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_').slice(0, 80);
    const unique = `${Date.now()}_${safeName}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const mimeOk = ALLOWED_MIME.includes(file.mimetype);
    const extOk = ALLOWED_EXT.includes(ext);
    if (mimeOk || (extOk && (file.mimetype === 'application/octet-stream' || !file.mimetype))) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed. Use PDF, Word, or plain text.'));
    }
  },
});

const handleUpload = (req, res) => {
  if (req.file) {
    // Return relative path so mobile can prepend its API base (e.g. http://192.168.1.5:3001)
    // localhost in stored URL would fail when opening on mobile
    const url = `/uploads/${req.file.filename}`;
    res.json({ url, filename: req.file.filename, originalName: req.file.originalname });
  } else {
    res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'No file uploaded' },
    });
  }
};

const uploadErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'File too large (max 10MB)' } });
    }
  }
  if (err.message?.includes('File type not allowed')) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: err.message } });
  }
  next(err);
};

export const uploadDocument = [upload.single('file'), handleUpload];
export { uploadErrorHandler };

