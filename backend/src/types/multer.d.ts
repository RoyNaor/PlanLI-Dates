declare module 'multer' {
  import { RequestHandler } from 'express';

  interface MulterOptions {
    storage?: any;
  }

  interface MulterInstance {
    single(field: string): RequestHandler;
  }

  interface Multer {
    (options?: MulterOptions): MulterInstance;
  }

  const multer: Multer;
  export default multer;
  export interface StorageEngine {}
}

declare namespace Express {
  namespace Multer {
    interface File {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      size: number;
      destination: string;
      filename: string;
      path: string;
      buffer: Buffer;
    }
  }
}
