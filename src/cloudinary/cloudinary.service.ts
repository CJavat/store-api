import { Inject, Injectable } from '@nestjs/common';
import { CLOUDINARY } from './cloudinary.provider';
import { v2 as CloudinaryApi, UploadApiResponse } from 'cloudinary';
import { Folder } from './interfaces/folder.type';

@Injectable()
export class CloudinaryService {
  constructor(@Inject(CLOUDINARY) private cloudinary: typeof CloudinaryApi) {}

  async uploadImage(
    file: Express.Multer.File,
    folder: Folder,
  ): Promise<UploadApiResponse | undefined> {
    //TODO: Agregar nuevo parámetro para saber si el usuario está actualizando foto o es nueva y así poder borrar las fotos viejas.
    return new Promise((resolve, reject) => {
      this.cloudinary.uploader
        .upload_stream({ folder: `store-api/${folder}` }, (error, result) => {
          if (error) return reject(error);

          resolve(result);
        })
        .end(file.buffer);
    });
  }
}
