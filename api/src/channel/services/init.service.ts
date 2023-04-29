import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Channel } from "../entities/channel.entity";
import { Page } from "@soundcore/common";

@Injectable()
export class InitChannelService {

    constructor(
        @InjectRepository(Channel) private readonly repository: Repository<Channel>,
    ) {}

    public async fetchAll(): Promise<Page<Channel>> {
        return this.repository.find({}).then((channels) => Page.of(channels, channels.length));
    }

}