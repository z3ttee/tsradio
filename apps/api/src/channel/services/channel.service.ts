import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { FindOptionsSelect, Repository } from "typeorm";
import { Channel } from "../entities/channel.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateChannelDTO } from "../dtos/create-channel.dto";
import { ChannelRegistry } from "./registry.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { GATEWAY_EVENT_CHANNEL_CREATED, GATEWAY_EVENT_CHANNEL_DELETED, GATEWAY_EVENT_CHANNEL_DISABLED, GATEWAY_EVENT_CHANNEL_REQUEST_RESTART, GATEWAY_EVENT_CHANNEL_UPDATED } from "../../constants";
import { User } from "../../user/entities/user.entity";
import { ChannelOverview } from "../entities/channel-overview.entity";
import { Page, Pageable, createSlug, isNull } from "@tsa/utilities";
import { StreamStatus } from "../../streams/entities/stream";
import { Track } from "../../track";

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
            currentListeners: true,
            currentTrack: {
                name: true,
                featuredArtists: {
                    name: true
                },
                primaryArtist: {
                    name: true
                },
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
                currentTrack: {
                    featuredArtists: true,
                    primaryArtist: true
                }
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
                currentTrack: {
                    featuredArtists: true,
                    primaryArtist: true
                }
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
    public async findByIdOrFail(id: string): Promise<Channel> {
        if(isNull(id)) throw new NotFoundException("Channel not found");
        return this.repository.findOne({ 
            where: [
                { id: id },
                { slug: id }
            ],
            relations: {
                artwork: true,
                currentTrack: {
                    primaryArtist: true,
                    featuredArtists: true
                }
            },
            select: {
                id: true,
                name: true,
                description: true,
                enabled: true,
                featured: true,
                status: true,
                slug: true,
                currentListeners: true,
                currentTrack: {
                    id: true,
                    name: true,
                    album: true,
                    primaryArtist: {
                        name: true,
                    },
                    featuredArtists: {
                        name: true,
                    }
                },
                artwork: {
                    id: true
                }
            }
        }).then((channel) => {
            if(isNull(channel)) throw new NotFoundException("Channel not found");
            return channel;
        })
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

    /**
     * Check if a channel already exists by name
     * in the database
     * @param name Name of the channel
     * @returns Returns `true` if the channel already exists
     */
    public async existsByName(name: string): Promise<boolean> {
        return this.repository.findOne({ where: {
            name: name
        }, select: ["id"]}).then((channel) => !isNull(channel))
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

    public async createIfNotExists(dto: CreateChannelDTO): Promise<Channel> {
        return this.existsByName(dto.name).then((exists) => {
            if(exists) throw new BadRequestException("Channel with that name already exists");

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
            });
        });
    }

    /**
     * Set the current status for a channel
     * @param channelId Id of the channel
     * @param status Status of the channel
     * @returns Status information that was set to the channel
     */
    public async setStatus(channelId: string, status: StreamStatus): Promise<StreamStatus> {
        const channel = await this.findById(channelId);
        if(isNull(channel)) throw new NotFoundException("Channel not found");

        return this.repository.update(channelId, {
            status: status
        }).then(() => status);
    }

    /**
     * Set the current status for a channel
     * @param channelId Id of the channel
     * @param status Status of the channel
     * @returns Status information that was set to the channel
     */
    public async setCurrentTrack(channelId: string, track: Track): Promise<Track> {
        const channel = await this.findById(channelId);
        if(isNull(channel)) throw new NotFoundException("Channel not found");

        return this.repository.update(channelId, {
            currentTrack: track
        }).then(() => track);
    }

    /**
     * Set the current status for a channel
     * @param channelId Id of the channel
     * @param listeners Number of current listeners
     * @returns Listener count that was set
     */
    public async setListeners(channelId: string, listeners: number): Promise<number> {
        const channel = await this.findById(channelId);
        if(isNull(channel)) throw new NotFoundException("Channel not found");

        return this.repository.update(channelId, {
            currentListeners: listeners ?? 0
        }).then(() => listeners);
    }

    public async updateStreamInfo(channelId: string, status?: StreamStatus | null, currentTrack?: Track | null, listeners?: number | null): Promise<boolean> {
        const channel = await this.findById(channelId);
        if(isNull(channel)) throw new NotFoundException("Channel not found");

        return this.repository.update(channel.id, {
            status: status ?? StreamStatus.OFFLINE,
            currentTrack: currentTrack ?? null,
            currentListeners: listeners ?? 0
        }).then(() => true);
    }

    public async updateById(id: string, dto: CreateChannelDTO): Promise<Channel> {
        const channel = await this.findById(id);
        if(isNull(channel)) throw new BadRequestException("Channel not found");

        const hasNameChanged = dto.name !== channel.name;
        // Check if the channel now got disabled and
        // was previously enabled
        const gotDisabled = !isNull(dto.enabled) && !dto.enabled && channel.enabled;

        channel.featured = dto.featured ?? channel.featured;
        channel.enabled = dto.enabled ?? channel.enabled;
        channel.name = dto.name ?? channel.name;
        channel.description = dto.description ?? channel.description;
        channel.slug = hasNameChanged ? createSlug(channel.name) : channel.slug;

        return this.repository.save(channel).then((channel) => {
            if(gotDisabled) {
                // TODO: Check what happens to the stream when channel gets disabled
                // When the channel got disabled,
                // remove the channel from all connected clients
                this.logger.warn(`Channel '${channel.name}' got disabled by user request.`);
                this.emitter.emit(GATEWAY_EVENT_CHANNEL_DISABLED, channel.id);
                return channel;
            }

            if(channel.enabled) {
                // Only register the channel, if it is enabled
                this.registry.set(channel);
                this.emitter.emit(GATEWAY_EVENT_CHANNEL_UPDATED, channel);
            }
            
            return channel;
        });
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