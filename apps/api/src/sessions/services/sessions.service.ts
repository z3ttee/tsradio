import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Session } from "../entities/session.entity";
import { Repository } from "typeorm";
import { Channel } from "../../channel/entities/channel.entity";
import { User } from "../../user/entities/user.entity";
import { isNull } from "@tsa/utilities";

@Injectable()
export class SessionService {
    
    constructor(
        @InjectRepository(Session) private readonly repository: Repository<Session>
    ) {}

    public async findById(sessionId: string): Promise<Session> {
        if(isNull(sessionId)) return null;
        return this.repository.findOne({
            where: {
                id: sessionId
            }
        });
    }

    public async create(user: User, channel: Channel): Promise<Session> {
        return this.repository.save(new Session(user, channel));
    }

    public async endSession(sessionId: string): Promise<Session> {
        const session = await this.findById(sessionId);
        if(isNull(session)) throw new NotFoundException("Session not found");

        const startedAt = session.startedAt;
        const endedAt = new Date();

        const timeDiffMs = endedAt.getTime() - startedAt.getTime();
        const minimumRequiredTimeDiffMs = (1000*30) // 30 Seconds
        const timeDiffSec = timeDiffMs / 1000;

        // If time difference is below minimum, delete session
        if(timeDiffMs < minimumRequiredTimeDiffMs) {
            return this.deleteById(sessionId).then(() => null);
        }

        session.endedAt = endedAt;
        session.durationInSeconds = Math.round(timeDiffSec);
        return this.repository.save(session);
    }

    public async deleteById(sessionId: string): Promise<boolean> {
        const session = await this.findById(sessionId);
        if(isNull(session)) throw new NotFoundException("Session not found");

        return this.repository.delete(session.id).then((result) => result.affected > 0);
    }

}