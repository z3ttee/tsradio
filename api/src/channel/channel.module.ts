import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Channel } from "./entities/channel.entity";
import { ChannelController } from "./controllers/channel.controller";
import { ChannelService } from "./services/channel.service";

@Module({
    controllers: [
        ChannelController
    ],
    imports: [
        TypeOrmModule.forFeature([ Channel ])
    ],
    providers: [
        ChannelService
    ]
})
export class ChannelModule {}