import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ChannelService } from "../services/channel.service";
import { CreateChannelDTO } from "../dtos/create-channel.dto";
import { Roles } from "src/authentication/decorators/role.decorator";
import { ROLE_ADMIN } from "src/constants";
import { Pageable, Pagination } from "@soundcore/common";

@Controller("channels")
export class ChannelController {

    constructor(private readonly service: ChannelService) {}

    @Get("")
    public async findAll(@Pagination() pageable: Pageable) {
        return this.service.findAll(pageable);
    }

    @Get(":channelId")
    public async findById(@Param("channelId") channelId: string) {
        return this.service.findById(channelId);
    }

    @Roles(ROLE_ADMIN)
    @Post("")
    public async createIfNotExists(@Body() dto: CreateChannelDTO) {
        return this.service.createIfNotExists(dto);
    }

    @Roles(ROLE_ADMIN)
    @Put(":channelId")
    public async updateById(@Param("channelId") channelId: string, @Body() dto: CreateChannelDTO) {
        return this.service.updateById(channelId, dto);
    }

    @Roles(ROLE_ADMIN)
    @Delete(":channelId")
    public async deleteById(@Param("channelId") channelId: string) {
        return this.service.deleteById(channelId);
    }

}