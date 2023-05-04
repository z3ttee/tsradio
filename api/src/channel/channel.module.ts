import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Channel } from "./entities/channel.entity";
import { ChannelController } from "./controllers/channel.controller";
import { ChannelService } from "./services/channel.service";
import { ChannelRegistry } from "./services/registry.service";
import { InitChannelService } from "./services/init.service";
import { FileSystemService } from "src/filesystem/services/filesystem.service";

export const DI_TOKEN_CHANNELS: string = "__di_token_channels__";

@Module({
    controllers: [
        ChannelController
    ],
    imports: [
        TypeOrmModule.forFeature([ Channel ])
    ],
    providers: [
        ChannelService,
        InitChannelService,
        {
            provide: DI_TOKEN_CHANNELS,
            inject: [ InitChannelService, FileSystemService ],
            useFactory: async (service: InitChannelService, fs: FileSystemService) => {
                return service.fetchAll().then((page) => page.items);
            }
        },
        {
            provide: ChannelRegistry,
            inject: [DI_TOKEN_CHANNELS, FileSystemService ],
            useFactory: (channels: Channel[], fs: FileSystemService) => {
                return new ChannelRegistry(fs, channels);
            }
        }
    ],
    exports: [
        ChannelService,
        ChannelRegistry
    ]
})
export class ChannelModule {}