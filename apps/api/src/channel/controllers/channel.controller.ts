import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ChannelService } from "../services/channel.service";
import { CreateChannelDTO } from "../dtos/create-channel.dto";
import { ChannelRegistry } from "../services/registry.service";
import { Authentication } from "../../authentication/decorators/authentication.decorator";
import { User } from "../../user/entities/user.entity";
import { ROLE_ADMIN } from "../../constants";
import { Roles } from "../../authentication/decorators/role.decorator";
import { Pagination } from "@tsa/nestjs";
import { Pageable } from "@tsa/utilities";

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

    @Get("overview")
    public async findOverview() {
        return this.service.findChannelOverview();
    }

    @Get(":channelId")
    public async findById(@Param("channelId") channelId: string) {
        return this.service.findByIdOrFail(channelId);
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