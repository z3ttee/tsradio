
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Artwork } from "../../artworks/entities/artwork.entity";
import { User } from "../../user/entities/user.entity";
import { Session } from "../../sessions/entities/session.entity";
import { StreamStatus } from "../../streams/entities/stream";
import { Schedule } from "../../schedule/entities/schedule.entity";
import { Track } from "../../track";

@Entity()
export class Channel {

    @PrimaryGeneratedColumn("uuid")
    public readonly id: string;

    @Column({ unique: true, nullable: false })
    public name: string;

    @Column({ nullable: true, unique: true })
    public slug: string;

    @Column({ nullable: true })
    public description: string;

    @Column({ type: "boolean", default: true })
    public enabled: boolean;

    @Column({ default: 0, nullable: false })
    public currentListeners: number;

    @Column({ type: "boolean", default: false })
    public featured: boolean;

    @OneToOne(() => Artwork, (a) => a.channel, { onDelete: "SET NULL" })
    @JoinColumn()
    public artwork: Artwork;

    @ManyToMany(() => Channel)
    public users: User[];

    @OneToMany(() => Session, (s) => s.channel)
    public sessions: Session[];

    @ManyToOne(() => Schedule, { nullable: true })
    @JoinColumn()
    public schedule: Schedule;

    @Column({ type: "enum", enum: StreamStatus, default: StreamStatus.OFFLINE })
    public status: StreamStatus;

    @OneToMany(() => Track, (t) => t.channel)
    public tracks: Track[];

    @ManyToOne(() => Track, { nullable: true })
    @JoinColumn()
    public currentTrack?: Track;
    
}