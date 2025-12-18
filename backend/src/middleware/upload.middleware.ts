import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary } from '../config/cloudinary';

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'date-ideas-app-v1',
    allowed_formats: ['jpg', 'png', 'jpeg']
  }
});

export const upload = multer({ storage });
export const uploadSingleImage = upload.single('image');
