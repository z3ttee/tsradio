
import { Column, Entity, JoinColumn, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Artwork } from "../../artworks/entities/artwork.entity";
import { User } from "../../user/entities/user.entity";
import { Session } from "../../sessions/entities/session.entity";
import { Track } from "../../streams/entities/track";
import { StreamStatus } from "../../streams/entities/stream";

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

    @OneToMany(() => Session, (s) => s.channel)
    public sessions: Session[];

    public status: StreamStatus;
    public track: Track;
    
}