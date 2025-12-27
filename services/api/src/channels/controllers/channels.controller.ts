import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ChannelsService } from '../services/channels.service';
import { CreateChannelDto, UpdateChannelDto } from '../dtos';
import { Channel } from '../entities/channel.entity';

@Controller('channels')
export class ChannelsController {
  constructor(private readonly _channelsService: ChannelsService) {}

  @Get()
  public async findAll(): Promise<Channel[]> {
    return this._channelsService.findAll();
  }

  @Get(':id')
  public async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Channel> {
    return this._channelsService.findById(id);
  }

  @Get('slug/:slug')
  public async findBySlug(@Param('slug') slug: string): Promise<Channel> {
    return this._channelsService.findBySlug(slug);
  }

  @Post()
  public async create(
    @Body() createChannelDto: CreateChannelDto,
  ): Promise<Channel> {
    return this._channelsService.create(createChannelDto);
  }

  @Put(':id')
  public async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateChannelDto: UpdateChannelDto,
  ): Promise<Channel> {
    return this._channelsService.update(id, updateChannelDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this._channelsService.delete(id);
  }
}
