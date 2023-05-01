import { Controller, Get, Param, Query, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { Public } from "src/authentication/decorators/public.decorator";
import { StreamService } from "../services/stream.service";

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

}