import { Channel } from "src/channel/entities/channel.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Session {

    @PrimaryGeneratedColumn("uuid")
    public readonly id: string;

    @ManyToOne(() => User, (u) => u.sessions, {  onDelete: "CASCADE", nullable: false })
    @JoinColumn()
    public user: User;

    @ManyToOne(() => Channel, (c) => c.sessions, {  onDelete: "CASCADE", nullable: false })
    @JoinColumn()
    public channel: Channel;

    @Column({ nullable: false })
    public startedAt: Date;

    @Column({ nullable: true })
    public durationInSeconds: number;

    @Column({ nullable: true })
    public endedAt: Date;

    constructor();
    constructor(user: User, channel: Channel)
    constructor(user?: User, channel?: Channel) {
        this.user = user;
        this.startedAt = new Date();
    }
}