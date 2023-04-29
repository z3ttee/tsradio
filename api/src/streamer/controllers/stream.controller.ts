import { Controller, Get, Param, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { Public } from "src/authentication/decorators/public.decorator";
import { StreamerService } from "../services/streamer.service";
import { ChannelService } from "src/channel/services/channel.service";

@Controller("streams")
export class StreamController {

    constructor(
        private readonly channelService: ChannelService,
        private readonly service: StreamerService
    ) {}

    @Public(true)
    @Get(":channelId")
    public async streamChannel(@Param("channelId") channelId: string, @Res() res: Response, @Req() req: Request) {
        console.log(channelId)
        // return null;
        const channel = await this.channelService.findById(channelId);
        const stream = this.service.startStream(channel);

        const { id, client } = stream.addClient();

        res.set({
            "Content-Type": "audio/mp3",
            "Transfer-Encoding": "chunked",
        }).status(200);

        client.pipe(res);

        req.on("close", () => {
            stream.removeClient(id);
        });
    }

}