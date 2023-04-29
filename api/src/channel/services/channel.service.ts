import { BadRequestException, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { Channel } from "../entities/channel.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateChannelDTO } from "../dtos/create-channel.dto";
import { Page, Pageable, isNull } from "@soundcore/common";
import { Slug } from "@tsalliance/utilities";
import { ChannelRegistry } from "./registry.service";

@Injectable()
export class ChannelService {

    constructor(
        private readonly registry: ChannelRegistry,
        @InjectRepository(Channel) private readonly repository: Repository<Channel>,
    ) {}

    public async fetchAll(): Promise<Page<Channel>> {
        return this.repository.find({

        }).then((channels) => Page.of(channels, channels.length));
    }

    public async findById(id: string): Promise<Channel> {
        return this.repository.findOne({ 
            where: [
                { id: id },
                { slug: id }
            ],
            relations: {
                artwork: true
            }
        });
    }

    public async findAll(pageable: Pageable): Promise<Page<Channel>> {
        return this.repository.createQueryBuilder("channel")
            .limit(pageable.limit)
            .offset(pageable.offset)
            .getManyAndCount().then(([channels, total]) => Page.of(channels, total, pageable));
    }

    public async createIfNotExists(dto: CreateChannelDTO): Promise<Channel> {
        return this.repository.createQueryBuilder()
            .insert()
            .orUpdate(["name", "description"], ["id"], { skipUpdateIfNoValuesChanged: false })
            .values({
                ...dto,
                slug: Slug.create(dto.name)
            })
            .execute().then((insertResult) => {
                if(insertResult.identifiers.length <= 0) return null;
                const id = insertResult.identifiers[0]?.id;
                return this.findById(id).then((channel) => {
                    this.registry.set(channel);
                    return channel;
                });
            })
    }

    public async updateById(id: string, dto: CreateChannelDTO): Promise<Channel> {
        const channel = await this.findById(id);
        if(isNull(channel)) throw new BadRequestException("Channel not found");

        return this.repository.save({
            ...channel,
            ...dto,
            id: id,
            slug: channel.slug
        }).then((channel) => {
            this.registry.set(channel);
            return channel;
        });;
    }

    public async deleteById(id: string): Promise<boolean> {
        return this.repository.delete(id).then((result) => result.affected > 0).then((deleted) => {
            if(deleted) this.registry.remove(id);
            return deleted;
        })
    }

}