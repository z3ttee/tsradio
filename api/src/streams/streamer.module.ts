import { Module } from "@nestjs/common";
import { ChannelModule } from "src/channel/channel.module";
import { StreamerCoordinator } from "./coordinator/coordinator.service";
import { JwtModule } from "@nestjs/jwt";
import { StreamsController } from "./controllers/streams.controller";
import { StreamService } from "./services/stream.service";
import { HistoryModule } from "src/history/history.module";

@Module({
    controllers: [
        StreamsController
    ],
    providers: [
        StreamService,
        StreamerCoordinator
    ],
    imports: [
        ChannelModule,
        HistoryModule,
        JwtModule.register({})
    ]
})
export class StreamerModule {}