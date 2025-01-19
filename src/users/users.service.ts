import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  async findOne(username: string) {
    return {
      username: 'john_doe',
      password: 'doe_john',
    };
  }
}
