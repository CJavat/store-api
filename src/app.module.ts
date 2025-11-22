import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { SeedModule } from './seed/seed.module';
import { UsersModule } from './users/users.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [ConfigModule.forRoot(), AuthModule, SeedModule, UsersModule, CloudinaryModule, CommonModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
