import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Schedule } from "./entities/schedule.entity";
import { ScheduleEntry } from "./entities/schedule-entry.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([ Schedule, ScheduleEntry ])
    ]
})
export class ScheduleModule {}
