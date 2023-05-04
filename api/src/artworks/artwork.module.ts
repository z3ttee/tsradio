import { BadRequestException, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Artwork } from "./entities/artwork.entity";
import { MulterModule } from "@nestjs/platform-express";
import { FileSystemService } from "src/filesystem/services/filesystem.service";
import { ArtworkController } from "./controllers/artwork.controller";
import { ArtworkService } from "./services/artwork.service";
import { ChannelModule } from "src/channel/channel.module";
import { SharpPipe } from "./pipes/sharp.pipe";
import { memoryStorage } from "multer";

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