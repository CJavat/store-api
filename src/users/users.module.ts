import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [AuthModule, CloudinaryModule],
})
export class UsersModule {}
