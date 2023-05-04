import { Module } from "@nestjs/common";
import { ChannelModule } from "src/channel/channel.module";
import { StreamerCoordinator } from "./coordinator/coordinator.service";
import { JwtModule } from "@nestjs/jwt";
import { StreamsController } from "./controllers/streams.controller";
import { StreamService } from "./services/stream.service";
import { HistoryModule } from "src/history/history.module";
import { OIDCModule } from "src/authentication/oidc.module";
import { UserModule } from "src/user/user.module";

@Module({
    controllers: [
        StreamsController
    ],
    providers: [
        StreamService,
        StreamerCoordinator
    ],
    imports: [
        OIDCModule,
        UserModule,
        ChannelModule,
        HistoryModule,
        JwtModule.register({})
    ]
})
export class StreamModule {}