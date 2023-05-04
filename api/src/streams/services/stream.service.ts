import { BadRequestException, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { ChannelService } from "src/channel/services/channel.service";
import { Request, Response } from "express";
import { OIDCService } from "src/authentication/services/oidc.service";
import { catchError, firstValueFrom, of, take } from "rxjs";
import { isNull } from "@soundcore/common";
import { User } from "src/user/entities/user.entity";
import { StreamerCoordinator } from "../coordinator/coordinator.service";
import { HistoryService } from "src/history/services/history.service";

@Injectable()
export class StreamService {
    private readonly logger = new Logger(StreamService.name);

    constructor(
        private readonly channelService: ChannelService,
        private readonly coordinator: StreamerCoordinator,
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
            const stream = await this.coordinator.startStream(channel);

            const listener = await firstValueFrom(stream.createListener());

            res.set({
                "Content-Type": "audio/mp3",
                "Transfer-Encoding": "chunked",
            }).status(200);

            listener.client.pipe(res);

            req.on("close", () => {
                stream.removeListener(listener.id).subscribe();
            });
        });        
    }

    public async forceSkipTrack(channelId: string, authentication: User): Promise<boolean> {
        const stream = this.coordinator.getStreamByChannelId(channelId);
        if(isNull(stream)) throw new BadRequestException("Channel not streaming");

        return firstValueFrom(stream.skip()).then(() => {
            this.logger.log(`User '${authentication.name}' skipped current track on channel '${stream.name}'`);
            return true
        }).catch((error: Error) => {
            console.error(error);
            throw new InternalServerErrorException("Cannot skip current track");
        });
    }
    
}