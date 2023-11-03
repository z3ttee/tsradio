import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ScheduleEntry } from "../../schedule/entities/schedule-entry.entity";

@Entity()
export class Playlist {

    @PrimaryGeneratedColumn("uuid")
    public readonly id: string;

    @Column()
    public name: string;

    @Column({ unique: true })
    public directory: string;

    @OneToMany(() => ScheduleEntry, entry => entry.playlist)
    public schedules: ScheduleEntry[];
}
