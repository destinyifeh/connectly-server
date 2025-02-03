import multer from 'multer';
import path from 'path';
const allowedImages = ['image/jpeg', 'image/jpg', 'image/png'];
function fileFilter(req, file, cb) {
  if (allowedImages.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'), false);
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join('../public', 'uploads'));
  },

  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `${timestamp}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {fileSize: 1000000}, // 1 MB limit
  fileFilter: fileFilter,
});

export default upload;
