const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedImage = /jpeg|jpg|png|gif|webp|svg/;
  const allowedVideo = /mp4|mov|avi|webm|mkv/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const mime = file.mimetype;

  if (allowedImage.test(ext) || mime.startsWith('image/')) {
    cb(null, true);
  } else if (allowedVideo.test(ext) || mime.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
});

module.exports = upload;
