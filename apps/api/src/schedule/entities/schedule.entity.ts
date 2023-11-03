import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Channel } from "../../channel/entities/channel.entity";
import { ScheduleEntry } from "./schedule-entry.entity";

@Entity()
export class Schedule {

    @PrimaryGeneratedColumn("uuid")
    public readonly id: string;

    @OneToMany(() => Channel, (c) => c.schedule)
    public channels: Channel[];

    @OneToMany(() => ScheduleEntry, entry => entry.schedule)
    public entries: ScheduleEntry[];

}
