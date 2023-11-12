import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Channel } from "../../channel/entities/channel.entity";
import { Artist } from "../../artist";

@Entity()
@Index(["name", "album", "primaryArtist", "channel"], { unique: true })
export class Track {
    @PrimaryGeneratedColumn("uuid")
    public readonly id: string;

    @Column({ collation: "utf8mb4_general_ci" })
    public name: string;

    @Column({ collation: "utf8mb4_general_ci", nullable: true })
    public album?: string;

    @Column({ collation: "utf8mb4_general_ci", type: "mediumtext", nullable: true })
    public featuredArtists?: string;

    @ManyToOne(() => Artist, { nullable: true, onDelete: "CASCADE" })
    @JoinColumn()
    public primaryArtist?: Artist;

    @ManyToOne(() => Channel, { nullable: false, onDelete: "CASCADE" })
    @JoinColumn()
    public channel: Channel;

}
