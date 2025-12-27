import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  public readonly id: string;

  @Column({ unique: true })
  public token: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  public user: User;

  @Column({ nullable: true })
  public clientId: string;

  @Column()
  public expiresAt: Date;

  @CreateDateColumn()
  public readonly createdAt: Date;
}
