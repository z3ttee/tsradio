import { Module } from "@nestjs/common";
import { ChannelModule } from "src/channel/channel.module";
import { StreamerService } from "./services/streamer.service";
import { StreamerCoordinator } from "./coordinator/coordinator.service";
import { JwtModule } from "@nestjs/jwt";
import { StreamController } from "./controllers/stream.controller";

@Module({
    controllers: [
        StreamController
    ],
    providers: [
        StreamerService,
        StreamerCoordinator
    ],
    imports: [
        ChannelModule,
        JwtModule.register({})
    ]
})
export class StreamerModule {}