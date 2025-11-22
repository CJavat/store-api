import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { Folder } from '../interfaces/folder.type';

@Injectable()
export class FolderValidationPipe implements PipeTransform {
  transform(value: any): Folder {
    const validFolders: Folder[] = [
      'users',
      'categories',
      'products',
      'others',
    ];

    if (!validFolders.includes(value))
      throw new BadRequestException(
        `folderName must be one of: ${validFolders.join(', ')}`,
      );

    return value as Folder;
  }
}
