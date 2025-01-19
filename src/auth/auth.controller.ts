// src/auth/auth.controller.ts
import { Controller, Request, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';

interface LoginRequest {
  username: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Request() req: {
    body: LoginRequest;
  }) {
    return this.authService.login(req.body.username, req.body.password);
  }

  @Post('access-token')
  async accessToken(@Request() req: {
    body: { refreshToken: string };
  }) {
    return this.authService.refreshAccessToken(req.body.refreshToken);
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: { user: any }) {
    return req.user;
  }
}
