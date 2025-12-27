import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('authorization_codes')
export class AuthorizationCode {
  @PrimaryGeneratedColumn('uuid')
  public readonly id: string;

  @Column({ unique: true })
  public code: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  public user: User;

  @Column()
  public clientId: string;

  @Column()
  public redirectUri: string;

  @Column({ nullable: true })
  public codeChallenge: string;

  @Column({ nullable: true })
  public codeChallengeMethod: string;

  @Column({ nullable: true })
  public nonce: string;

  @Column()
  public expiresAt: Date;

  @CreateDateColumn()
  public readonly createdAt: Date;
}
