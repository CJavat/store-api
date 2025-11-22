import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [ConfigModule.forRoot(), AuthModule, SeedModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
