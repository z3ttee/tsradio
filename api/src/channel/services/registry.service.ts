import { Inject, Injectable, Logger } from "@nestjs/common";
import { Channel } from "../entities/channel.entity";
import { DI_TOKEN_CHANNELS } from "../channel.module";
import { existsSync, mkdirSync } from "fs";
import { FileSystemService } from "src/filesystem/services/filesystem.service";
import { Page, Pageable } from "@soundcore/common";

@Injectable()
export class ChannelRegistry {
    private readonly logger = new Logger(ChannelRegistry.name);

    private readonly channels: Map<string, Channel> = new Map();

    constructor(
        private readonly fs: FileSystemService,
        @Inject(DI_TOKEN_CHANNELS) channels: Channel[]
    ) {
        for(const channel of channels) {
            this.set(channel);
        }

        this.logger.log(`Initialized channel registry. Found ${this.channels.size} channels`);
    }

    public set(channel: Channel) {
        this.channels.set(channel.id, channel);
        const directory = this.fs.resolveChannelDir(channel);

        if(!existsSync(directory)) {
            mkdirSync(directory, { recursive: true });
            this.logger.log(`Created directory for channel '${channel.name}'`);
        }
    }

    public remove(id: string) {
        this.channels.delete(id);
    }

    public get(id: string) {
        return this.channels.get(id);
    }

    public has(id: string) {
        return this.channels.has(id);
    }

    public getAll(pageable: Pageable): Page<Channel> {
        const channels = Array.from(this.channels.values());
        return Page.of(channels.slice(Math.min(channels.length, pageable.offset), Math.min(channels.length, pageable.offset+pageable.limit)), channels.length, pageable);
    }

    public values(): Channel[] {
        return Array.from(this.channels.values());
    }

}