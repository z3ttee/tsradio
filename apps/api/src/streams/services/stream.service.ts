import { BadRequestException, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { Request, Response } from "express";
import { catchError, firstValueFrom, of, take } from "rxjs";
import { StreamerCoordinator } from "../coordinator/coordinator.service";
import { OIDCService } from "../../authentication/services/oidc.service";
import { ChannelService } from "../../channel/services/channel.service";
import { SessionService } from "../../sessions/services/sessions.service";
import { UserService } from "../../user/services/user.service";
import { Session } from "../../sessions/entities/session.entity";
import { User } from "../../user/entities/user.entity";
import { isNull } from "@tsa/utilities";

@Injectable()
export class StreamService {
    private readonly logger = new Logger(StreamService.name);

    constructor(
        private readonly channelService: ChannelService,
        private readonly coordinator: StreamerCoordinator,
        private readonly oidcService: OIDCService,
        private readonly userService: UserService,
        private readonly sessionService: SessionService
    ) {}

    public async startStreamForClient(channelId: string, token: string, req: Request, res: Response) {
        this.oidcService.verifyAccessToken(token).pipe(take(1), catchError((err, caught) => {
            // Deny access and send 403 header
            res.status(403).send();
            return of(null);
        })).subscribe(async (payload) => {
            if(isNull(payload)) return;

            // Find user by provided access_token
            this.userService.findOrCreateByTokenPayload(payload).then(async (user) => {

                const channel = await this.channelService.findById(channelId);
                const stream = await this.coordinator.startStream(channel);
                const session: Session | null = await this.sessionService.create(user, channel).catch((error: Error) => {
                    this.logger.error(`Failed creating session: ${error.message}`, error);
                    return null;
                });
    
                const listener = await firstValueFrom(stream.createListener());
    
                res.set({
                    "Content-Type": "audio/mp3",
                    "Transfer-Encoding": "chunked",
                }).status(200);
    
                listener.client.pipe(res);
    
                req.on("close", () => {
                    this.sessionService.endSession(session?.id).catch((error: Error) => {
                        this.logger.error(`Failed ending session: ${error.message}`, error);
                    });
                    stream.removeListener(listener.id).subscribe();
                });
            }).catch((error: Error) => {
                this.logger.error(`Could not add listener to stream: ${error.message}`, error);
                res.status(500).send();
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