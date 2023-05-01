import { Module } from "@nestjs/common";
import { ChannelModule } from "src/channel/channel.module";
import { StreamerService } from "./services/streamer.service";
import { StreamerCoordinator } from "./coordinator/coordinator.service";
import { JwtModule } from "@nestjs/jwt";
import { StreamsController } from "./controllers/streams.controller";
import { StreamService } from "./services/stream.service";

@Module({
    controllers: [
        StreamsController
    ],
    providers: [
        StreamerService,
        StreamService,
        StreamerCoordinator
    ],
    imports: [
        ChannelModule,
        JwtModule.register({})
    ]
})
export class StreamerModule {}