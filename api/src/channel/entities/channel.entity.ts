import { Artwork } from "src/artworks/entities/artwork.entity";
import { Session } from "src/sessions/entities/session.entity";
import { StreamStatus } from "src/streams/entities/stream";
import { Track } from "src/streams/entities/track";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

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

    @Column({ type: "boolean", default: false })
    public featured: boolean;

    @OneToOne(() => Artwork, (a) => a.channel, { onDelete: "SET NULL" })
    @JoinColumn()
    public artwork: Artwork;

    @ManyToMany(() => Channel)
    public users: User[];

    @ManyToOne(() => Session, (s) => s.channel)
    public sessions: Session[];

    public status: StreamStatus;
    public track: Track;
    
}