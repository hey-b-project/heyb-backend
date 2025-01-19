import { BaseEntity } from 'src/common/base.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as crypto from 'crypto';

@Entity()
export class User extends BaseEntity {
  constructor(username: string, password: string) {
    super();
    this.username = username;
    this.password = this.hashPassword(password);
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  comparePassword(password: string) {
    if (this.password !== this.hashPassword(password)) {
      throw new Error('Password not matched');
    }
  }

  hashPassword(password: string): string {
    const salt = 'salt' + this.username;
    return crypto
      .createHash('sha256')
      .update(password + salt)
      .digest('hex');
  }
}

@Entity()
export class Token extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @Column()
  userId: number;

  @Column({ type: 'datetime', nullable: true, default: () => 'NULL' })
  expiredAt: Date | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
