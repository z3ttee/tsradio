import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Playlist } from "./entities/playlist.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([ Playlist ])
    ]
})
export class PlaylistModule {}
