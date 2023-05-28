import { BadRequestException, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Artwork } from "./entities/artwork.entity";
import { MulterModule } from "@nestjs/platform-express";
import { ArtworkController } from "./controllers/artwork.controller";
import { ArtworkService } from "./services/artwork.service";
import { SharpPipe } from "./pipes/sharp.pipe";
import { memoryStorage } from "multer";
import { ChannelModule } from "../channel/channel.module";
import { FileSystemService } from "../filesystem/services/filesystem.service";

export const imageFileFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return callback(new BadRequestException('Only jpg and png files are allowed'), false);
    }

    callback(null, true);
};

@Module({
    controllers: [
        ArtworkController
    ],
    providers: [
        ArtworkService,
        SharpPipe
    ],
    imports: [
        ChannelModule,
        TypeOrmModule.forFeature([ Artwork ]),
        MulterModule.registerAsync({
            inject: [ FileSystemService ],
            useFactory: async (fs: FileSystemService) => ({
                storage: memoryStorage(),
                fileFilter: (req, file, callback) => imageFileFilter(req, file, callback),
            })
        })
    ]
})
export class ArtworkModule {}