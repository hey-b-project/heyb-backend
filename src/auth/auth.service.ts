import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { User } from 'src/users/users.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async register(username: string, password: string) {
    const existingUser = await this.usersRepository.findOne({
      where: { username },
    });
    if (existingUser) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    const user = this.usersRepository.create(new User(username, password));
    await this.usersRepository.save(user);
  }

  async login(username: string, password: string) {
    try {
      const user = await this.usersService.findOne(username);
      if (!user) {
        return { message: 'User not found' };
      }
      user.comparePassword(password);

      const payload = { username: user.username, sub: user.id };
      const refreshToken = await this.makeToken(user);

      return {
        access_token: this.jwtService.sign(payload),
        refresh_token: refreshToken,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const tokenEntity = await this.usersService.findByToken(refreshToken);
      if (!tokenEntity) {
        throw new Error('Invalid refresh token');
      }
      if (tokenEntity.expiredAt) {
        throw new Error('Refresh token revoked');
      }

      const user = tokenEntity.user;
      const payload = { username: user.username, sub: user.id };
      return {
        access_token: this.jwtService.sign(payload),
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async makeToken(user: User) {
    const uniqueString = `${uuidv4()}-${user.username}-${Date.now()}`;
    await this.usersService.updateToken(user.id, uniqueString);
    return uniqueString;
  }
}
