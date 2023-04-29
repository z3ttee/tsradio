import { Artwork } from "src/artworks/entities/artwork.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

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
    
}