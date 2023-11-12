import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Artist } from "./entities/artist.entity";
import { ArtistService } from "./services/artist.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([ Artist ])
    ],
    providers: [
        ArtistService
    ],
    exports: [
        ArtistService
    ]
})
export class ArtistModule {}