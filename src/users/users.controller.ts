import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

import { PaginationDto } from '../common/dto/pagination.dto';
import { Auth } from 'src/auth/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from 'src/common/helpers/file-filter';

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

  @Patch('update-user/:id')
  @Auth()
  update(
    @Req() request: Express.Request,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    request.user;
    return this.usersService.updateUser(request, id, updateUserDto);
  }

  @Patch('update-image-user/:id')
  @Auth()
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
    }),
  )
  updateImage(
    @Req() request: Express.Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.updateUserImage(request, file);
  }

  @Patch('disable-account/:id')
  @Auth()
  disable(@Req() request: Express.Request, @Param('id') id: string) {
    return this.usersService.disableUser(request, id);
  }

  @Patch('enable-account/:token')
  enable(@Param('token') token: string) {
    return this.usersService.enableUser(token);
  }

  @Delete('remove-user/:id')
  @Auth()
  remove(@Req() request: Express.Request, @Param('id') id: string) {
    return this.usersService.deleteUser(request, id);
  }
}
