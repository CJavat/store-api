import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Auth, GetUser } from './decorators';
import { User } from 'generated/prisma/client';

import { LoginDto, CreateUserDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }

  //! Instalar Nodemailer para los siguientes enpoints
  //TODO: Olvidé mi contraseña (enviar correo con link, poner como parametro link de frontend, y en el link enviar un token)
  //TODO: Verificar email GET
}
