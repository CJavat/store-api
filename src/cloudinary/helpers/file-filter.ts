import { Request } from 'express';

interface FileFilter {
  req: Request;
  file: Express.Multer.File;
  cb: Function;
}

export const fileFilter = ({ req, file, cb }: FileFilter) => {
  if (!file) return cb(new Error('file is empty'), false);

  const fileExtension = file.mimetype.split('/').at(1);
  if (!fileExtension) return cb(new Error('file extension is unknown'), false);

  const validExtensions = ['jpg', 'png', 'jpeg'];

  if (validExtensions.includes(fileExtension)) return cb(null, true);

  cb(null, false);
};
