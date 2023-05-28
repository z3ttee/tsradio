import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Channel } from "../../channel/entities/channel.entity";

@Entity()
export class Artwork {

    @PrimaryGeneratedColumn("uuid")
    public readonly id: string;

    @Column({ nullable: false })
    public filename: string;

    @OneToOne(() => Channel, (c) => c.artwork, { onDelete: "CASCADE" })
    public channel: Channel;

}