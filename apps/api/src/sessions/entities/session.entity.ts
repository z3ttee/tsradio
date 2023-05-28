import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";
import { Channel } from "../../channel/entities/channel.entity";

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
        this.channel = channel;
        this.startedAt = new Date();
    }
}