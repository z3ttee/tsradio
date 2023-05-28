import { Module } from "@nestjs/common";
import { StreamerCoordinator } from "./coordinator/coordinator.service";
import { JwtModule } from "@nestjs/jwt";
import { StreamsController } from "./controllers/streams.controller";
import { StreamService } from "./services/stream.service";
import { OIDCModule } from "../authentication/oidc.module";
import { UserModule } from "../user/user.module";
import { ChannelModule } from "../channel/channel.module";
import { HistoryModule } from "../history/history.module";
import { SessionsModule } from "../sessions/sessions.module";

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
        SessionsModule,
        JwtModule.register({})
    ]
})
export class StreamModule {}