import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { UserService } from "./services/user.service";
import { UsersController } from "./controllers/user.controller";

@Module({
    controllers: [
        UsersController
    ],
    imports: [
        TypeOrmModule.forFeature([ User ])
    ],
    providers: [
        UserService
    ],
    exports: [
        UserService
    ]
})
export class UserModule {}