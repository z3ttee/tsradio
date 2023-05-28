import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ChannelService } from "../services/channel.service";
import { CreateChannelDTO } from "../dtos/create-channel.dto";
import { Pageable, Pagination } from "@soundcore/common";
import { ChannelRegistry } from "../services/registry.service";
import { Authentication } from "../../authentication/decorators/authentication.decorator";
import { User } from "../../user/entities/user.entity";
import { ROLE_ADMIN } from "../../constants";
import { Roles } from "../../authentication/decorators/role.decorator";

@Controller("channels")
export class ChannelController {

    constructor(
        private readonly service: ChannelService,
        private readonly registry: ChannelRegistry
    ) {}

    @Get("")
    public async findAll(@Pagination() pageable: Pageable, @Authentication() authentication: User) {
        return this.service.findAll(pageable, authentication);
    }

    @Get("featured")
    public async findFeatured(@Pagination() pageable: Pageable, @Authentication() authentication: User) {
        return this.service.findFeatured(pageable, authentication);
    }

    @Get(":channelId")
    public async findById(@Param("channelId") channelId: string) {
        return this.service.findById(channelId);
    }

    @Get(":channelId/restart")
    public async restartById(@Param("channelId") channelId: string) {
        return this.service.restartById(channelId);
    }

    @Roles(ROLE_ADMIN)
    @Post("")
    public async createIfNotExists(@Body() dto: CreateChannelDTO) {
        return this.service.createIfNotExists(dto)
    }

    @Roles(ROLE_ADMIN)
    @Put(":channelId")
    public async updateById(@Param("channelId") channelId: string, @Body() dto: CreateChannelDTO) {
        return this.service.updateById(channelId, dto)
    }

    @Roles(ROLE_ADMIN)
    @Delete(":channelId")
    public async deleteById(@Param("channelId") channelId: string) {
        return this.service.deleteById(channelId)
    }

}