declare module 'multer-storage-cloudinary' {
  import { StorageEngine } from 'multer';

  interface CloudinaryStorageParams {
    folder?: string;
    allowed_formats?: string[];
    [key: string]: unknown;
  }

  interface CloudinaryStorageOptions {
    cloudinary: any;
    params?: CloudinaryStorageParams;
  }

  export class CloudinaryStorage implements StorageEngine {
    constructor(options: CloudinaryStorageOptions);
    _handleFile(req: Express.Request, file: Express.Multer.File, cb: (error?: any, info?: Partial<Express.Multer.File>) => void): void;
    _removeFile(req: Express.Request, file: Express.Multer.File, cb: (error: Error | null) => void): void;
  }
}
