// src/auth/auth.controller.ts
import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';

interface LoginRequest {
  username: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Request() req: { body: LoginRequest }) {
    return this.authService.register(req.body.username, req.body.password);
  }

  @Post('login')
  async login(@Request() req: { body: LoginRequest }) {
    return this.authService.login(req.body.username, req.body.password);
  }

  @Post('accessToken')
  async accessToken(@Request() req: { body: { refreshToken: string } }) {
    return this.authService.refreshAccessToken(req.body.refreshToken);
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: { user: any }) {
    return req.user;
  }
}
