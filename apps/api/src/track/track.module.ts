import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Track } from "./entities/track.entity";
import { TrackService } from "./services/track.service";
import { ChannelModule } from "../channel/channel.module";
import { ArtistModule } from "../artist";

@Module({
    imports: [
        TypeOrmModule.forFeature([ Track ]),
        ArtistModule
    ],
    providers: [
        TrackService
    ],
    exports: [
        TrackService
    ]
})
export class TrackModule {}
