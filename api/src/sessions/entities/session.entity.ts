import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Session {

    @PrimaryGeneratedColumn("uuid")
    public readonly id: string;

    @ManyToOne(() => User, (u) => u.sessions, {  onDelete: "CASCADE", nullable: false })
    @JoinColumn()
    public user: User;

    @Column({ nullable: false })
    public startedAt: Date;

    @Column({ nullable: true })
    public durationInSeconds: number;

    @Column({ nullable: true })
    public endedAt: Date;

    constructor(user?: User) {
        this.user = user;
        this.startedAt = new Date();
    }
}