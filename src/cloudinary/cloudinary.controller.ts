import {
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';

import { fileFilter } from './helpers/file-filter';
import { Folder } from './interfaces/folder.type';
import { FolderValidationPipe } from './pipes/folder-validation.pipe';

@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('upload-image')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
    }),
  )
  async uploadImageFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('folderName', FolderValidationPipe) folderName: Folder,
  ) {
    //TODO: Actualizar que se eliminen las fotos viejas cuando el usuario actualiza su foto.
    const result = await this.cloudinaryService.uploadImage(file, folderName);
    if (!result)
      throw new InternalServerErrorException(
        'Ocurrió un error al subir tu imagen',
      );

    return {
      url: result.url,
      public_id: result.public_id,
    };
  }
}
