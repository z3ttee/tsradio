import { Controller, Get, Param, Query, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { StreamService } from "../services/stream.service";
import { Authentication } from "../../authentication/decorators/authentication.decorator";
import { User } from "../../user/entities/user.entity";
import { ROLE_ADMIN } from "../../constants";
import { Public } from "../../authentication/decorators/public.decorator";
import { Roles } from "../../authentication/decorators/role.decorator";

@Controller("streams")
export class StreamsController {

    constructor(
        private readonly service: StreamService
    ) {}

    @Public(true)
    @Get(":channelId")
    public async streamChannel(@Param("channelId") channelId: string, @Res() res: Response, @Req() req: Request, @Query("token") token: string) {
        this.service.startStreamForClient(channelId, token, req, res);
    }

    @Roles(ROLE_ADMIN)
    @Get(":channelId/skip")
    public async forceSkipCurrentTrack(@Param("channelId") channelId: string, @Authentication() authentication: User) {
        return this.service.forceSkipTrack(channelId, authentication);
    }

}