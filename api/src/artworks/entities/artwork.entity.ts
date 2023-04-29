import { Channel } from "src/channel/entities/channel.entity";
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Artwork {

    @PrimaryGeneratedColumn("uuid")
    public readonly id: string;

    @Column({ nullable: false })
    public filename: string;

    @OneToOne(() => Channel, (c) => c.artwork, { onDelete: "CASCADE" })
    public channel: Channel;

}