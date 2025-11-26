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
    oldImagePublicId?: string,
  ): Promise<UploadApiResponse | undefined> {
    const result: Promise<UploadApiResponse | undefined> = new Promise(
      (resolve, reject) => {
        this.cloudinary.uploader
          .upload_stream({ folder: `store-api/${folder}` }, (error, result) => {
            if (error) return reject(error);

            resolve(result);
          })
          .end(file.buffer);
      },
    );

    // Eliminar imagen vieja de Cloudinary
    if (oldImagePublicId) {
      try {
        await this.cloudinary.uploader.destroy(oldImagePublicId);
      } catch (error) {
        console.warn('No se pudo borrar la imagen anterior.', error);
      }
    }

    return result;
  }
}
