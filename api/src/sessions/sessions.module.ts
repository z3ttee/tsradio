import { Module } from "@nestjs/common";
import { SessionService } from "./services/sessions.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Session } from "./entities/session.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([ Session ])
    ],
    providers: [
        SessionService
    ],
    exports: [
        SessionService
    ]
})
export class SessionsModule {}