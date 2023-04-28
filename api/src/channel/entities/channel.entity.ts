import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Channel {

    @PrimaryGeneratedColumn("uuid")
    public readonly id: string;

    @Column({ unique: true, nullable: false })
    public name: string;

    @Column({ nullable: true })
    public description: string;

    @Column({ nullable: false })
    public mountpoint: string;

    @Column({ type: "bit", default: 0 })
    public enabled: boolean;

    @Column({ type: "bit", default: 0 })
    public featured: boolean;

    @Column({ type: "varchar", length: 7, nullable: true })
    public color: string;
    
}