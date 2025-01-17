// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';


@Injectable()
export class AuthService{
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);
    if (!user) {
      return { message: 'User not found' };
    }

    const payload = { username: user.username, sub: user.userId };

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.makeToken({ user: user }),
    };
  }

  private makeToken(param: { user: any }) {
    return uuidv4();
  }

  refreshAccessToken(refreshToken: string) {
    return Promise.resolve(undefined);
  }
}
