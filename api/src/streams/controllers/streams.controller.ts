import { Controller, Get, Param, Query, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { Public } from "src/authentication/decorators/public.decorator";
import { StreamService } from "../services/stream.service";
import { Roles } from "src/authentication/decorators/role.decorator";
import { ROLE_ADMIN } from "src/constants";
import { Authentication } from "src/authentication/decorators/authentication.decorator";
import { User } from "src/user/entities/user.entity";

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