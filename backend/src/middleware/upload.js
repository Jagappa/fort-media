const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { v2: cloudinary } = require('cloudinary');

/* ═══════════════════════════════════════════════
   MEDIA UPLOAD

   Render's free plan gives the service an ephemeral filesystem: anything
   written to ./uploads is discarded on every restart, redeploy and wake
   from sleep, while MongoDB keeps pointing at paths that no longer exist.
   So in production files stream straight to Cloudinary and the database
   stores the full https URL instead of a local path.

   Local development keeps writing to ./uploads, so no Cloudinary account
   is needed just to run the project. Which mode is active depends purely
   on whether the three Cloudinary credentials are present.
   ═══════════════════════════════════════════════ */

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;
const useCloudinary = Boolean(CLOUD_NAME && API_KEY && API_SECRET);

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/* ─── Cloudinary storage engine ───
   Multer storage is just an object with _handleFile / _removeFile, so the
   file stream can be piped to Cloudinary without ever touching disk. */
class CloudinaryStorage {
  _handleFile(req, file, cb) {
    const isVideo = String(file.mimetype || '').startsWith('video/');

    const options = {
      folder: process.env.CLOUDINARY_FOLDER || 'fort-media',
      public_id: uuidv4(),
      resource_type: isVideo ? 'video' : 'image',
    };

    const done = (err, result) => {
      if (err) return cb(err);
      if (!result) return cb(new Error('Cloudinary upload returned no result'));
      cb(null, {
        filename: result.public_id,
        path: result.secure_url,
        size: result.bytes,
        cloudinaryId: result.public_id,
        resourceType: result.resource_type,
      });
    };

    // Large videos must go up in chunks or the request stalls out.
    const target = isVideo
      ? cloudinary.uploader.upload_chunked_stream(
          { ...options, chunk_size: 20 * 1024 * 1024 },
          done
        )
      : cloudinary.uploader.upload_stream(options, done);

    file.stream.on('error', cb);
    file.stream.pipe(target);
  }

  /* Called by multer to clean up when a later file in the same request
     fails — otherwise a half-failed multi-file upload leaves orphans. */
  _removeFile(req, file, cb) {
    if (!file || !file.cloudinaryId) return cb(null);
    cloudinary.uploader
      .destroy(file.cloudinaryId, { resource_type: file.resourceType || 'image' })
      .then(() => cb(null))
      .catch(cb);
  }
}

let storage;

if (useCloudinary) {
  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET,
    secure: true,
  });
  storage = new CloudinaryStorage();
  console.log('✓ Media storage: Cloudinary');
} else {
  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${uuidv4()}${ext}`);
    },
  });
  console.log('✓ Media storage: local disk (./uploads) — set CLOUDINARY_* to use Cloudinary');
}

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

/* The one place that decides what gets written to MongoDB.
   Cloudinary hands back an absolute https URL in file.path; local disk
   storage does not, so that case still needs the /uploads prefix. */
const fileUrl = (file) => {
  if (!file) return undefined;
  if (file.path && /^https?:\/\//.test(file.path)) return file.path;
  return '/uploads/' + file.filename;
};

module.exports = upload;
module.exports.fileUrl = fileUrl;
module.exports.usingCloudinary = useCloudinary;
