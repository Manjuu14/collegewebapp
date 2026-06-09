const multer = require('multer');
const path = require('path');

// Storage config – saves to /uploads/<type>/
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const type = req.uploadType || 'misc';
        cb(null, path.join(__dirname, '..', 'uploads', type));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = `${Date.now()}-${Math.round(Math.random() * 1e5)}${ext}`;
        cb(null, name);
    },
});

// File filter – only images
const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = allowed.test(file.mimetype);
    if (extOk && mimeOk) return cb(null, true);
    cb(new Error('Only JPG, PNG, and WebP images are allowed.'));
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
});

// Middleware factory: sets req.uploadType so destination callback knows the folder
const uploadImage = (type) => (req, res, next) => {
    req.uploadType = type;
    upload.single('image')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: err.code === 'LIMIT_FILE_SIZE' ? 'File too large (max 2 MB).' : err.message });
        }
        if (err) return res.status(400).json({ message: err.message });
        next();
    });
};

module.exports = { uploadImage };
