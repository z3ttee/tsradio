import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('channels')
export class Channel {
  @PrimaryGeneratedColumn('uuid')
  public readonly id: string;

  @Column()
  public name: string;

  @Column({ unique: true })
  public slug: string;

  @CreateDateColumn()
  public readonly createdAt: Date;

  @UpdateDateColumn()
  public readonly updatedAt: Date;
}
