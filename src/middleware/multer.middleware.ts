import multer from 'multer';
import config from '../config/config';

const storage = multer.memoryStorage();

function mimetypeFilter(req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const allowedTypes = ['application/pdf', 'text/markdown', 'text/plain'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only TXT, PDF or MD are allowed.'));
  }
}

const uploadFileSizeLimit = parseInt(config.get('UPLOAD_FILE_SIZE_LIMIT') || '5242880'); // 5MB

const upload = multer({
  storage,
  fileFilter: mimetypeFilter,
  limits: {
    fileSize: uploadFileSizeLimit,
  },
});

export default upload;
