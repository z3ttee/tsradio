import { Column, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Channel } from "../../channel/entities/channel.entity";
import { Artist } from "../../artist";
import { Exclude } from "class-transformer";

@Entity()
@Index(["name", "album", "primaryArtist", "channel", "filename"], { unique: true })
export class Track {
    @PrimaryGeneratedColumn("uuid")
    public readonly id: string;

    @Column({ collation: "utf8mb4_general_ci" })
    public name: string;

    @Column({ nullable: false })
    @Exclude()
    public filename?: string;

    @Column({ collation: "utf8mb4_general_ci", nullable: true })
    public album?: string;

    @ManyToMany(() => Artist, { nullable: true })
    @JoinTable({ name: "featArtists2track" })
    public featuredArtists?: Artist[];

    @ManyToOne(() => Artist, { nullable: true, onDelete: "CASCADE" })
    @JoinColumn()
    public primaryArtist?: Artist;

    @ManyToOne(() => Channel, { nullable: false, onDelete: "CASCADE" })
    @JoinColumn()
    @Exclude()
    public channel: Channel;

}
