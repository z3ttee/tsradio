import { BadRequestException, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { ChannelService } from "src/channel/services/channel.service";
import { Request, Response } from "express";
import { OIDCService } from "src/authentication/services/oidc.service";
import { catchError, firstValueFrom, of, take } from "rxjs";
import { isNull } from "@soundcore/common";
import { User } from "src/user/entities/user.entity";
import { StreamerCoordinator } from "../coordinator/coordinator.service";
import { UserService } from "src/user/services/user.service";
import { SessionService } from "src/sessions/services/sessions.service";
import { Session } from "src/sessions/entities/session.entity";

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

                // Added channel to users history asynchronously
                this.userService.addChannelToHistory(user.id, channelId).then((wasAdded) => {
                    if(wasAdded) {
                        return this.userService.findChannelHistoryByCurrentUser(user.id).then((channels) => {
                            return this.coordinator.pushHistoryToClient(user.id, channels.items.map((c) => c.id));
                        });
                    }
                }).catch((error: Error) => {
                    this.logger.error(`Could not add channel to user's history: ${error.message}`, error);
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