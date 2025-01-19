import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Token, User } from './users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
  ) {}

  async findOne(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findByToken(token: string): Promise<Token | undefined> {
    return this.tokenRepository.findOne({
      where: { token, expiredAt: Not(IsNull()) },
      relations: ['user'],
    });
  }

  async updateToken(userId: number, uniqueString: string) {
    const queryRunner =
      this.usersRepository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      // 새 토큰 생성
      const token = queryRunner.manager.create(Token, {
        userId: userId,
        token: uniqueString,
      });

      const isNotExpired = await queryRunner.manager
        .getRepository(Token)
        .createQueryBuilder('token')
        .where('token.userId = :userId', { userId })
        .andWhere('token.expiredAt IS NULL')
        .getMany();

      // 기존 토큰 만료 처리
      if (isNotExpired.length > 0) {
        await Promise.all(
          isNotExpired.map((oldToken) => {
            oldToken.expiredAt = new Date();
            return queryRunner.manager.save(oldToken);
          }),
        );
      }

      // 새 토큰 저장
      await queryRunner.manager.save(token);

      // 트랜잭션 커밋
      await queryRunner.commitTransaction();
      return token;
    } catch (error) {
      // 트랜잭션 롤백
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // QueryRunner 해제
      await queryRunner.release();
    }
  }
}
