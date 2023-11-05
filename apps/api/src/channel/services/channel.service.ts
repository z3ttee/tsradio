import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { FindOptionsSelect, Repository } from "typeorm";
import { Channel } from "../entities/channel.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateChannelDTO } from "../dtos/create-channel.dto";
import { ChannelRegistry } from "./registry.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { GATEWAY_EVENT_CHANNEL_CREATED, GATEWAY_EVENT_CHANNEL_DELETED, GATEWAY_EVENT_CHANNEL_REQUEST_RESTART, GATEWAY_EVENT_CHANNEL_UPDATED } from "../../constants";
import { User } from "../../user/entities/user.entity";
import { ChannelOverview } from "../entities/channel-overview.entity";
import { Page, Pageable, createSlug, isNull } from "@tsa/utilities";

@Injectable()
export class ChannelService {
    private readonly logger = new Logger(ChannelService.name);

    constructor(
        private readonly registry: ChannelRegistry,
        private readonly emitter: EventEmitter2,
        @InjectRepository(Channel) private readonly repository: Repository<Channel>,
    ) {}

    /**
     * Find an overview of all channels.
     * The returned object contains two lists.
     * One list has all featured channels while the
     * other list only has non-featured channels
     * @returns Object representing the overview
     */
    public async findChannelOverview(): Promise<ChannelOverview> {
        const cols: FindOptionsSelect<Channel> = {
            id: true,
            name: true,
            slug: true,
            description: true,
            artwork: {
                id: true
            },
            featured: true,
            status: true,
            track: {
                name: true,
                featuredArtists: true,
                primaryArtist: true
            }
        }

        return Promise.all([
            this.findAllFeaturedChannels(cols),
            this.findAllNonFeaturedChannels(cols)
        ]).then(([featured, nonfeatured]) => ({
            featured: featured ?? [],
            nonfeatured: nonfeatured ?? []
        }));
    }

    /**
     * Find all featured channels
     * @param cols Optional selection of returned columns
     * @returns List of featured channels
     */
    public async findAllFeaturedChannels(cols?: FindOptionsSelect<Channel>): Promise<Channel[]> {
        return this.repository.find({
            where: {
                featured: true,
                enabled: true
            },
            relations: {
                artwork: true,
                track: true
            },
            select: cols
        }).catch((error: Error) => {
            this.logger.error(`Error occured while fetching featured channels: ${error.message}`, error.stack);
            throw new InternalServerErrorException();
        });
    }

    /**
     * Find all non-featured channels
     * @param cols Optional selection of returned columns
     * @returns List of non-featured channels
     */
    public async findAllNonFeaturedChannels(cols?: FindOptionsSelect<Channel>): Promise<Channel[]> {
        return this.repository.find({
            where: {
                featured: false,
                enabled: true
            },
            relations: {
                artwork: true,
                track: true
            },
            select: cols
        }).catch((error: Error) => {
            this.logger.error(`Error occured while fetching non-featured channels: ${error.message}`, error.stack);
            throw new InternalServerErrorException();
        });
    }

    public async fetchAll(): Promise<Page<Channel>> {
        return this.repository.find({

        }).then((channels) => Page.of(channels, channels.length));
    }

    /**
     * Find a channel by its id
     * @param id Id of the channel
     */
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

    public async restartById(id: string): Promise<boolean> {
        const channel = await this.findById(id);
        if(isNull(channel)) throw new NotFoundException("Channel not found");

        this.emitter.emit(GATEWAY_EVENT_CHANNEL_REQUEST_RESTART, channel);
        return true;
    }

    public async findAll(pageable: Pageable, authentication?: User): Promise<Page<Channel>> {
        return this.repository.createQueryBuilder("channel")
            .leftJoin("channel.artwork", "artwork").addSelect(["artwork.id"])
            .limit(pageable.limit)
            .offset(pageable.offset)
            .getManyAndCount().then(([channels, total]) => Page.of(channels, total, pageable));
    }

    public async findFeatured(pageable: Pageable, authentication?: User): Promise<Page<Channel>> {
        return this.repository.createQueryBuilder("channel")
            .limit(pageable.limit)
            .offset(pageable.offset)
            .where("channel.featured = :featured", { featured: true })
            .getManyAndCount().then(([channels, total]) => Page.of(channels, total, pageable));
    }

    public async createIfNotExists(dto: CreateChannelDTO): Promise<Channel> {
        return this.repository.createQueryBuilder()
            .insert()
            .orUpdate(["name", "description"], ["id"], { skipUpdateIfNoValuesChanged: false })
            .values({
                ...dto,
                slug: createSlug(dto.name)
            })
            .execute().then((insertResult) => {
                if(insertResult.identifiers.length <= 0) return null;
                const id = insertResult.identifiers[0]?.id;
                return this.findById(id).then((channel) => {
                    this.registry.set(channel);
                    this.emitter.emit(GATEWAY_EVENT_CHANNEL_CREATED, channel);
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
            this.emitter.emit(GATEWAY_EVENT_CHANNEL_UPDATED, channel);
            return channel;
        });;
    }

    public async deleteById(id: string): Promise<boolean> {
        return this.repository.delete(id).then((result) => result.affected > 0).then((deleted) => {
            if(deleted) {
                this.registry.remove(id);
                this.emitter.emit(GATEWAY_EVENT_CHANNEL_DELETED, id);
            }
            return deleted;
        })
    }

}