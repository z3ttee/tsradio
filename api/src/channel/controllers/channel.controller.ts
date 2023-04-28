import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ChannelService } from "../services/channel.service";
import { CreateChannelDTO } from "../dtos/create-channel.dto";

@Controller("channels")
export class ChannelController {

    constructor(private readonly service: ChannelService) {}

    @Get(":channelId")
    public async findById(@Param("channelId") channelId: string) {
        return this.service.findById(channelId);
    }

    @Post("")
    public async createIfNotExists(@Body() dto: CreateChannelDTO) {
        return this.service.createIfNotExists(dto);
    }

}