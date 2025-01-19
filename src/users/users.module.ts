import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token, User } from './users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Token])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
