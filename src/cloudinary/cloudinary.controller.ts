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
import { FolderValidationPipe } from './pipes/folder-validation.pipe';

import { fileFilter } from '../common/helpers/file-filter';
import { Folder } from './interfaces/folder.type';

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
    @Body('publicId') oldImagePublicId: string,
  ) {
    const result = await this.cloudinaryService.uploadImage(
      file,
      folderName,
      oldImagePublicId,
    );

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
