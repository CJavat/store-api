import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

import { PaginationDto } from '../common/dto/pagination.dto';
//TODO: TERMINAR CONTROLADOR.
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('find-all-users')
  findAll(@Query() paginationDto: PaginationDto) {
    return this.usersService.findAllUsers(paginationDto);
  }

  @Get('find-user/:id')
  findUser(@Param('id') id: string) {
    return this.usersService.findOneUser(id);
  }

  @Patch('upadte-user/:id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Patch('update-image-user/:id')
  updateImage(@UploadedFile() file: Express.Multer.File) {
    return this.usersService.updateUserImage(file);
  }

  @Patch('disable-account/:id')
  disable(@Param('id') id: string) {
    return this.usersService.disableUser(id);
  }

  @Patch('enable-account/:id')
  enable(@Param('id') id: string) {
    return this.usersService.enableUser(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
