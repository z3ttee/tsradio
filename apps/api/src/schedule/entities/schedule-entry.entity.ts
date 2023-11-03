import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Schedule } from "./schedule.entity";
import { Playlist } from "../../playlist/entities/playlist.entity";

@Entity()
export class ScheduleEntry {

    @PrimaryGeneratedColumn("uuid")
    public readonly id: string;

    @Column({ nullable: true })
    public startAt?: Date;

    @Column({ nullable: true })
    public endAt?: Date;

    @Column()
    public scheduleId: string

    @Column()
    public playlistId: string

    @ManyToOne(() => Schedule, (schedule) => schedule.entries)
    public schedule: Schedule

    @ManyToOne(() => Playlist, (playlist) => playlist.schedules)
    public playlist: Playlist

    

}
