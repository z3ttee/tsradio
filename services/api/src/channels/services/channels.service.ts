import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from '../entities/channel.entity';
import { CreateChannelDto, UpdateChannelDto } from '../dtos';
import { ErrorCodes } from '../../errorCodes';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel)
    private readonly _channelsRepository: Repository<Channel>,
  ) {}

  public async findAll(): Promise<Channel[]> {
    return this._channelsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  public async findById(id: string): Promise<Channel> {
    const channel = await this._channelsRepository.findOne({ where: { id } });
    if (!channel) {
      throw new NotFoundException(ErrorCodes.CHANNEL_NOT_FOUND);
    }
    return channel;
  }

  public async findBySlug(slug: string): Promise<Channel> {
    const channel = await this._channelsRepository.findOne({ where: { slug } });
    if (!channel) {
      throw new NotFoundException(ErrorCodes.CHANNEL_NOT_FOUND);
    }
    return channel;
  }

  private async _findBySlugOrNull(slug: string): Promise<Channel | null> {
    return this._channelsRepository.findOne({ where: { slug } });
  }

  public async create(createChannelDto: CreateChannelDto): Promise<Channel> {
    // Check for existing slug
    const existingBySlug = await this._findBySlugOrNull(createChannelDto.slug);
    if (existingBySlug) {
      throw new ConflictException(ErrorCodes.CHANNEL_SLUG_ALREADY_EXISTS);
    }

    const channel = this._channelsRepository.create(createChannelDto);
    return this._channelsRepository.save(channel);
  }

  public async update(
    id: string,
    updateChannelDto: UpdateChannelDto,
  ): Promise<Channel> {
    const channel = await this.findById(id);

    // Check for slug conflict if updating slug
    if (updateChannelDto.slug && updateChannelDto.slug !== channel.slug) {
      const existingBySlug = await this._findBySlugOrNull(
        updateChannelDto.slug,
      );
      if (existingBySlug) {
        throw new ConflictException(ErrorCodes.CHANNEL_SLUG_ALREADY_EXISTS);
      }
    }

    Object.assign(channel, updateChannelDto);
    return this._channelsRepository.save(channel);
  }

  public async delete(id: string): Promise<void> {
    const channel = await this.findById(id);
    await this._channelsRepository.remove(channel);
  }
}
