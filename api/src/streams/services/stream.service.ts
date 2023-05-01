import { BadRequestException, Injectable } from "@nestjs/common";
import { ChannelService } from "src/channel/services/channel.service";
import { StreamerService } from "./streamer.service";
import { Request, Response } from "express";
import { OIDCService } from "src/authentication/services/oidc.service";
import { catchError, of, take } from "rxjs";
import { isNull } from "@soundcore/common";

@Injectable()
export class StreamService {

    constructor(
        private readonly channelService: ChannelService,
        private readonly service: StreamerService,
        private readonly oidcService: OIDCService
    ) {}

    public async startStreamForClient(channelId: string, token: string, req: Request, res: Response) {

        this.oidcService.verifyAccessToken(token).pipe(take(1), catchError((err, caught) => {
            // Deny access and send 403 header
            res.status(403).send();
            return of(null);
        })).subscribe(async (payload) => {
            if(isNull(payload)) return;

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
        });        
    }
    
}